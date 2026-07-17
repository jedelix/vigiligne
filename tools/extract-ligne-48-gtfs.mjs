import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
  throw new Error("Usage: node extract-ligne-48-gtfs.mjs <dossier-gtfs> <fichier-js>");
}

const routeId = "IDFM:C01089";
const directionId = "0";

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

async function rows(file, onRow) {
  const input = fs.createReadStream(file, { encoding: "utf8" });
  const reader = readline.createInterface({ input, crlfDelay: Infinity });
  let headers;
  for await (const line of reader) {
    if (!headers) {
      headers = parseCsvLine(line.replace(/^\uFEFF/, ""));
      continue;
    }
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    if (await onRow(row) === false) break;
  }
}

let selectedTrip;
await rows(path.join(source, "trips.txt"), (row) => {
  if (row.route_id === routeId && row.direction_id === directionId) {
    selectedTrip = row;
    return false;
  }
});

if (!selectedTrip) throw new Error("Trajet RATP 48 vers Romainville introuvable");

const shape = [];
await rows(path.join(source, "shapes.txt"), (row) => {
  if (row.shape_id === selectedTrip.shape_id) {
    shape.push([Number(row.shape_pt_lat), Number(row.shape_pt_lon), Number(row.shape_pt_sequence)]);
  }
});
shape.sort((a, b) => a[2] - b[2]);

const stopSequence = [];
await rows(path.join(source, "stop_times.txt"), (row) => {
  if (row.trip_id === selectedTrip.trip_id) {
    stopSequence.push({ id: row.stop_id, ordre: Number(row.stop_sequence) });
  }
});
stopSequence.sort((a, b) => a.ordre - b.ordre);

const wantedStops = new Set(stopSequence.map((stop) => stop.id));
const stopDetails = new Map();
await rows(path.join(source, "stops.txt"), (row) => {
  if (wantedStops.has(row.stop_id)) {
    stopDetails.set(row.stop_id, {
      nom: row.stop_name,
      lat: Number(row.stop_lat),
      lon: Number(row.stop_lon)
    });
  }
});

const coordinates = shape.map(([lat, lon]) => [lat, lon]);
const stops = stopSequence.map((stop) => ({ ...stop, ...stopDetails.get(stop.id) }));

const output = `/* Données cartographiques statiques extraites du GTFS IDFM le 17 juillet 2026.\n` +
  `   Ligne 48, direction Romainville-Vassou. Source : Île-de-France Mobilités. */\n` +
  `const TRAJET_48 = ${JSON.stringify({
    source: "GTFS Île-de-France Mobilités, 17 juillet 2026",
    direction: selectedTrip.trip_headsign,
    coordinates,
    stops
  }, null, 2)};\n`;

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, output, "utf8");
console.log(`${coordinates.length} points et ${stops.length} arrêts exportés vers ${destination}`);

/* ============================================================
   VigiLine : logique de l'application
   Prototype statique : aucune donnée réseau, tout vient de
   data/ligne-exemple.js (variable globale LIGNE).
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Référentiels ---------- */

  var TYPES = {
    "rond-point":     { libelle: "Rond-point serré" },
    "pont-bas":       { libelle: "Pont bas" },
    "gabarit-etroit": { libelle: "Passage étroit" },
    "travaux":        { libelle: "Zone de travaux" },
    "virage":         { libelle: "Virage difficile" },
    "arret-delicat":  { libelle: "Arrêt délicat" },
    "zone-ecole":     { libelle: "Zone scolaire" },
    "zone-pietonne":  { libelle: "Zone piétonne" }
  };

  /* "couleur" sert aux pictogrammes : tons moyens lisibles à la fois
     sur les fonds pastel clairs et sur l'écran sombre de la vision future */
  var NIVEAUX = {
    "standard":  { libelle: "Vigilance standard", court: "Standard", couleur: "#d99a00" },
    "renforcee": { libelle: "Vigilance renforcée", court: "Renforcée", couleur: "#e0761a" },
    "critique":  { libelle: "Vigilance critique", court: "Critique", couleur: "#e04338" }
  };

  /* ---------- Pictogrammes (SVG en ligne, couleur du niveau) ---------- */

  function icone(type, couleur) {
    var c = couleur || "#f2f5f9";
    var svgs = {
      "rond-point":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<circle cx="24" cy="24" r="15" stroke="' + c + '" stroke-width="5"/>' +
        '<circle cx="24" cy="24" r="5" fill="' + c + '"/>' +
        '<path d="M24 2 L29 10 L19 10 Z" fill="' + c + '"/>' +
        '</svg>',
      "pont-bas":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<path d="M6 40 V20 Q24 4 42 20 V40" stroke="' + c + '" stroke-width="4" fill="none"/>' +
        '<path d="M13 40 V24 Q24 13 35 24 V40" stroke="' + c + '" stroke-width="3" fill="none"/>' +
        '<path d="M20 30 h8 M24 26 v8" stroke="' + c + '" stroke-width="3"/>' +
        '</svg>',
      "gabarit-etroit":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<rect x="4" y="8" width="8" height="32" fill="' + c + '"/>' +
        '<rect x="36" y="8" width="8" height="32" fill="' + c + '"/>' +
        '<path d="M16 24 h5 M32 24 h-5" stroke="' + c + '" stroke-width="3"/>' +
        '<path d="M22 24 l-4 -4 v8 Z M26 24 l4 -4 v8 Z" fill="' + c + '"/>' +
        '</svg>',
      "travaux":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<path d="M24 8 L20 26 h8 Z" fill="' + c + '"/>' +
        '<path d="M17 32 h14 l3 8 h-20 Z" fill="' + c + '"/>' +
        '<rect x="10" y="42" width="28" height="3" rx="1.5" fill="' + c + '"/>' +
        '</svg>',
      "virage":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<path d="M14 42 V26 Q14 16 24 16 h6" stroke="' + c + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M28 8 L40 16 L28 24 Z" fill="' + c + '"/>' +
        '</svg>',
      "arret-delicat":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<rect x="10" y="6" width="28" height="24" rx="4" stroke="' + c + '" stroke-width="4"/>' +
        '<path d="M17 14 h14 M17 20 h9" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="22" y="30" width="4" height="14" fill="' + c + '"/>' +
        '</svg>',
      "zone-ecole":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<circle cx="17" cy="10" r="4" fill="' + c + '"/>' +
        '<path d="M17 15 v12 M17 19 l-6 5 M17 19 l6 3 M17 27 l-5 12 M17 27 l6 11" stroke="' + c + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<circle cx="34" cy="14" r="3.2" fill="' + c + '"/>' +
        '<path d="M34 18 v9 M34 21 l-5 4 M34 21 l5 3 M34 27 l-4 10 M34 27 l5 9" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>',
      "zone-pietonne":
        '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
        '<circle cx="24" cy="9" r="4.5" fill="' + c + '"/>' +
        '<path d="M24 15 v13 M24 19 l-8 6 M24 19 l8 6 M24 28 l-6 14 M24 28 l6 14" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>' +
        '</svg>'
    };
    return svgs[type] || svgs["virage"];
  }

  /* ---------- Navigation entre vues ---------- */

  var vues = {
    accueil: document.getElementById("vue-accueil"),
    parcours: document.getElementById("vue-parcours"),
    fiche: document.getElementById("vue-fiche"),
    conduite: document.getElementById("vue-conduite"),
    simulation: document.getElementById("vue-simulation")
  };

  var pointCourant = 0; // index dans LIGNE.points

  function afficher(nomVue) {
    Object.keys(vues).forEach(function (n) {
      vues[n].hidden = (n !== nomVue);
    });
    window.scrollTo(0, 0);
  }

  document.querySelectorAll(".btn-retour").forEach(function (btn) {
    btn.addEventListener("click", function () {
      arreterSimulation();
      afficher(btn.getAttribute("data-retour"));
      if (btn.getAttribute("data-retour") === "fiche") remplirFiche();
    });
  });

  /* ---------- Écran 1 : accueil ---------- */

  function remplirAccueil() {
    var conteneur = document.getElementById("liste-lignes");

    /* petit résumé du niveau global de difficulté de la ligne */
    var compte = { standard: 0, renforcee: 0, critique: 0 };
    LIGNE.points.forEach(function (p) { compte[p.niveau]++; });
    var resume =
      '<span class="mini-pastille niveau-critique">' + compte.critique + " critique" + (compte.critique > 1 ? "s" : "") + "</span>" +
      '<span class="mini-pastille niveau-renforcee">' + compte.renforcee + " renforcée" + (compte.renforcee > 1 ? "s" : "") + "</span>" +
      '<span class="mini-pastille niveau-standard">' + compte.standard + " standard" + (compte.standard > 1 ? "s" : "") + "</span>";

    conteneur.innerHTML =
      '<button class="carte-ligne" id="btn-ligne">' +
      '<span class="badge-ligne">' + LIGNE.nom.replace("Ligne ", "") + '</span>' +
      '<span class="carte-ligne-infos">' +
      '<span class="carte-ligne-trajet">' + LIGNE.depart + " &#8594; " + LIGNE.terminus + '</span>' +
      '<span class="carte-ligne-meta">' + LIGNE.points.length + " points de vigilance</span>" +
      '<span class="carte-ligne-resume">' + resume + "</span>" +
      '</span>' +
      '<span class="chevron">&#8250;</span>' +
      '</button>';

    document.getElementById("btn-ligne").addEventListener("click", function () {
      remplirParcours();
      afficher("parcours");
    });
  }

  /* ---------- Écran 2 : parcours annoté ---------- */

  function remplirParcours() {
    document.getElementById("parcours-titre").textContent = LIGNE.nom;
    document.getElementById("parcours-direction").textContent =
      LIGNE.depart + " vers " + LIGNE.terminus;

    var liste = document.getElementById("liste-points");
    var html = '<li class="terminus-item">Départ : ' + LIGNE.depart + "</li>";

    var points = LIGNE.points.slice().sort(function (a, b) { return a.ordre - b.ordre; });

    points.forEach(function (p, i) {
      var niveau = NIVEAUX[p.niveau];
      var type = TYPES[p.type];
      html +=
        '<li class="point-item">' +
        '<span class="point-ordre">' + p.ordre + "</span>" +
        '<button class="carte-point bord-' + p.niveau + '" data-index="' + i + '">' +
        '<span class="point-icone icone-' + p.niveau + '">' + icone(p.type, niveau.couleur) + "</span>" +
        '<span class="point-textes">' +
        '<span class="point-nom">' + p.nom + "</span>" +
        '<span class="point-type">' + type.libelle + "</span>" +
        "</span>" +
        '<span class="point-niveau niveau-' + p.niveau + '">' + niveau.court + "</span>" +
        "</button>" +
        "</li>";
    });

    html += '<li class="terminus-item">Terminus : ' + LIGNE.terminus + "</li>";
    liste.innerHTML = html;

    liste.querySelectorAll(".carte-point").forEach(function (btn) {
      btn.addEventListener("click", function () {
        pointCourant = parseInt(btn.getAttribute("data-index"), 10);
        remplirFiche();
        afficher("fiche");
      });
    });
  }

  /* ---------- Écran 3 : fiche point ---------- */

  function remplirFiche() {
    var points = LIGNE.points.slice().sort(function (a, b) { return a.ordre - b.ordre; });
    var p = points[pointCourant];
    var niveau = NIVEAUX[p.niveau];
    var type = TYPES[p.type];

    document.getElementById("fiche-position").textContent =
      LIGNE.nom + ", point " + p.ordre + " sur " + points.length;

    var html =
      '<div class="fiche-entete fond-' + p.niveau + '">' +
      '<span class="fiche-icone">' + icone(p.type, niveau.couleur) + "</span>" +
      "<div>" +
      '<div class="fiche-nom">' + p.nom + "</div>" +
      '<div class="fiche-niveau-libelle texte-' + p.niveau + '">' +
      type.libelle + " : " + niveau.libelle.toLowerCase() + "</div>" +
      (p.temporaire ? '<div class="chip-temporaire">Signalement provisoire</div>' : "") +
      "</div>" +
      "</div>" +

      '<div class="bloc-fiche">' +
      "<h3>Localisation</h3>" +
      "<p>" + p.localisation + "</p>" +
      "</div>" +

      '<div class="bloc-fiche bloc-anticiper">' +
      "<h3>Ce qu'il faut anticiper</h3>" +
      "<p>" + p.anticiper + "</p>" +
      "</div>";

    if (p.conseil && p.conseil.trim() !== "") {
      html +=
        '<div class="bloc-fiche">' +
        "<h3>Conseil de manoeuvre</h3>" +
        "<p>" + p.conseil + "</p>" +
        "</div>";
    }

    if (p.source && p.source.trim() !== "") {
      html += '<p class="fiche-source">Source : ' + p.source + "</p>";
    }

    html +=
      '<button class="btn-conduite" id="btn-vers-conduite">' +
      "Vision future : l'alerte embarquée &#8594;</button>";

    document.getElementById("fiche-contenu").innerHTML = html;

    document.getElementById("btn-vers-conduite").addEventListener("click", function () {
      remplirConduite();
      afficher("conduite");
    });
  }

  /* ---------- Écran 4 : aperçu conduite ---------- */

  function remplirConduite() {
    var points = LIGNE.points.slice().sort(function (a, b) { return a.ordre - b.ordre; });
    var p = points[pointCourant];
    var niveau = NIVEAUX[p.niveau];
    var type = TYPES[p.type];

    var html =
      '<div class="alerte-conduite fond-' + p.niveau + '">' +
      '<div class="alerte-icone">' + icone(p.type, niveau.couleur) + "</div>" +
      '<div class="alerte-message">' + type.libelle + " dans " + p.distance.replace(" ", "&nbsp;") + "</div>" +
      '<div class="alerte-distance">' + p.nom + "</div>" +
      '<span class="alerte-niveau niveau-' + p.niveau + '">' + niveau.libelle + "</span>";

    if (p.conseil && p.conseil.trim() !== "") {
      html += '<p class="alerte-conseil">' + p.conseil + "</p>";
    }
    html += "</div>";

    document.getElementById("conduite-contenu").innerHTML = html;
    document.getElementById("conduite-compteur").textContent =
      "Point " + p.ordre + " / " + points.length;

    document.getElementById("conduite-prec").disabled = (pointCourant === 0);
    document.getElementById("conduite-suiv").disabled = (pointCourant === points.length - 1);
  }

  document.getElementById("conduite-prec").addEventListener("click", function () {
    if (pointCourant > 0) { pointCourant--; remplirConduite(); }
  });

  document.getElementById("conduite-suiv").addEventListener("click", function () {
    if (pointCourant < LIGNE.points.length - 1) { pointCourant++; remplirConduite(); }
  });

  /* ---------- Écran 5 : carte scénarisée du trajet ----------
     Le tracé et les arrêts viennent d'un extrait GTFS conservé localement.
     Seul le fond OpenStreetMap est chargé en ligne. Aucun GPS n'est utilisé. */

  var sim = null;
  var carte = null;
  var PORTEE_ANNONCE = 0.8;
  var POINTS_ARRETS = [0, 2, 3, 5, 10, 11, 14, 15, 20, 22, 26];

  function hasard(min, max) { return min + Math.random() * (max - min); }

  function radians(valeur) { return valeur * Math.PI / 180; }

  function distanceMetres(a, b) {
    var rayon = 6371000;
    var dLat = radians(b[0] - a[0]);
    var dLon = radians(b[1] - a[1]);
    var lat1 = radians(a[0]);
    var lat2 = radians(b[0]);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * rayon * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function cap(a, b) {
    var lat1 = radians(a[0]);
    var lat2 = radians(b[0]);
    var dLon = radians(b[1] - a[1]);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function differenceCap(depart, arrivee) {
    return ((arrivee - depart + 540) % 360) - 180;
  }

  function indexFormeLePlusProche(coord, minimum) {
    var meilleur = minimum || 0;
    var distance = Infinity;
    for (var i = meilleur; i < TRAJET_48.coordinates.length; i++) {
      var d = distanceMetres(coord, TRAJET_48.coordinates[i]);
      if (d < distance) {
        distance = d;
        meilleur = i;
      }
    }
    return meilleur;
  }

  function longueurForme(debut, fin) {
    var total = 0;
    for (var i = Math.floor(debut) + 1; i <= Math.floor(fin); i++) {
      total += distanceMetres(TRAJET_48.coordinates[i - 1], TRAJET_48.coordinates[i]);
    }
    return total;
  }

  function construireManoeuvres() {
    var manoeuvres = [];
    var dernierIndex = 0;
    for (var i = 4; i < TRAJET_48.coordinates.length - 4; i++) {
      var avant = cap(TRAJET_48.coordinates[i - 4], TRAJET_48.coordinates[i]);
      var apres = cap(TRAJET_48.coordinates[i], TRAJET_48.coordinates[i + 4]);
      var difference = differenceCap(avant, apres);
      if (Math.abs(difference) >= 42 && longueurForme(dernierIndex, i) >= 140) {
        manoeuvres.push({
          index: i,
          direction: difference < 0 ? "gauche" : "droite",
          symbole: difference < 0 ? "↰" : "↱"
        });
        dernierIndex = i;
      }
    }
    return manoeuvres;
  }

  function preparerSimulation() {
    var arrets = TRAJET_48.stops;
    var indexArrets = [];
    var minimum = 0;
    arrets.forEach(function (arret) {
      var index = indexFormeLePlusProche([arret.lat, arret.lon], minimum);
      indexArrets.push(index);
      minimum = index;
    });

    var segments = [];
    for (var i = 0; i < arrets.length - 1; i++) {
      var debut = indexArrets[i];
      var fin = indexArrets[i + 1];
      var longueur = longueurForme(debut, fin);
      var direct = distanceMetres(TRAJET_48.coordinates[debut], TRAJET_48.coordinates[fin]);
      var rectitude = longueur ? direct / longueur : 0;
      var vitesseMax = longueur > 260 && rectitude > 0.82 ? 50 :
        longueur > 190 && rectitude > 0.72 ? 44 :
          longueur < 120 ? 28 : 36;
      var dense = Math.random() < 0.14;
      segments.push({
        duree: hasard(9000, 14500),
        bouchon: dense,
        vitesseMax: dense ? Math.min(vitesseMax, 18) : vitesseMax,
        feu: Math.random() < 0.24 ? {
          position: hasard(0.35, 0.72),
          duree: hasard(6000, 11000),
          fait: false
        } : null
      });
    }

    var dessertes = {};
    for (var j = 1; j < arrets.length; j++) {
      dessertes[j] = (j === arrets.length - 1) || Math.random() < 0.72
        ? hasard(5000, 9000) : 0;
    }

    var points = LIGNE.points.slice().sort(function (a, b) { return a.ordre - b.ordre; })
      .map(function (p, pointIndex) {
        var arretIndex = POINTS_ARRETS[pointIndex];
        var position = arretIndex === 0 ? 0.3 :
          arretIndex === arrets.length - 1 ? arretIndex - 0.5 : arretIndex - 0.3;
        return { donnees: p, position: position, annonce: false, arretIndex: arretIndex };
      });

    return {
      arrets: arrets,
      nbSeg: arrets.length - 1,
      indexArrets: indexArrets,
      segments: segments,
      dessertes: dessertes,
      points: points,
      manoeuvres: construireManoeuvres(),
      pos: 0,
      etat: "arret",
      attente: 4000,
      mult: 1,
      enPause: false,
      vitesse: 0,
      alerteAffichee: null,
      dernierTick: performance.now(),
      timer: null
    };
  }

  function indexFormeCourant() {
    if (sim.pos >= sim.nbSeg) return sim.indexArrets[sim.nbSeg];
    var segment = Math.max(0, Math.min(Math.floor(sim.pos), sim.nbSeg - 1));
    var fraction = sim.pos - segment;
    return sim.indexArrets[segment] +
      (sim.indexArrets[segment + 1] - sim.indexArrets[segment]) * fraction;
  }

  function coordonneeCourante(index) {
    var debut = Math.floor(index);
    var fin = Math.min(Math.ceil(index), TRAJET_48.coordinates.length - 1);
    var fraction = index - debut;
    var a = TRAJET_48.coordinates[debut];
    var b = TRAJET_48.coordinates[fin];
    return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
  }

  function initialiserCarte() {
    var conteneur = document.getElementById("sim-carte");
    conteneur.innerHTML = "";
    if (carte) {
      carte.remove();
      carte = null;
    }
    if (typeof L === "undefined") {
      conteneur.innerHTML = '<div class="sim-carte-erreur">Le fond de carte n\'a pas pu être chargé. Vérifiez la connexion Internet.</div>';
      return;
    }

    carte = L.map("sim-carte", { zoomControl: false, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(carte);

    sim.lignePassee = L.polyline([], { color: "#7d8796", weight: 8, opacity: 0.65 }).addTo(carte);
    sim.ligneRestante = L.polyline(TRAJET_48.coordinates, {
      color: "#7657ff", weight: 9, opacity: 0.92
    }).addTo(carte);

    sim.marqueursArrets = sim.arrets.map(function (arret, index) {
      return L.circleMarker([arret.lat, arret.lon], {
        radius: index === 0 || index === sim.arrets.length - 1 ? 6 : 4,
        color: "#ffffff",
        weight: 2,
        fillColor: "#7657ff",
        fillOpacity: 1
      }).bindTooltip(arret.nom).addTo(carte);
    });

    sim.points.forEach(function (point) {
      var couleur = NIVEAUX[point.donnees.niveau].couleur;
      var index = sim.indexArrets[point.arretIndex];
      L.circleMarker(TRAJET_48.coordinates[index], {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: couleur,
        fillOpacity: 1
      }).bindTooltip(point.donnees.nom).addTo(carte);
    });

    sim.marqueurBus = L.marker(TRAJET_48.coordinates[0], {
      icon: L.divIcon({
        className: "sim-bus-carte",
        html: '<span aria-label="Bus">48</span>',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      }),
      interactive: false
    }).addTo(carte);

    carte.setView(TRAJET_48.coordinates[0], 16);
    setTimeout(function () { if (carte) carte.invalidateSize(); }, 0);
  }

  function majStatut(titre, sousTitre) {
    document.getElementById("sim-etat").textContent = titre;
    document.getElementById("sim-sous-etat").textContent = sousTitre || "";
  }

  function majAlerte() {
    var zone = document.getElementById("sim-zone-alerte");
    var coque = document.querySelector(".sim-carte-coque");
    var portee = PORTEE_ANNONCE;

    var actif = null;
    for (var i = 0; i < sim.points.length; i++) {
      var pt = sim.points[i];
      if (sim.pos <= pt.position + 0.15 && pt.position - sim.pos <= portee) { actif = pt; break; }
    }

    if (!actif) {
      coque.classList.remove("alerte-active");
      if (sim.alerteAffichee !== "neutre") {
        zone.innerHTML = "";
        sim.alerteAffichee = "neutre";
      }
      return;
    }

    var p = actif.donnees;
    coque.classList.add("alerte-active");
    var niveau = NIVEAUX[p.niveau];
    var type = TYPES[p.type];
    actif.annonce = true;

    if (sim.alerteAffichee !== p.id) {
      zone.innerHTML =
        '<div class="sim-alerte fond-' + p.niveau + '">' +
        '<div class="sim-alerte-icone">' + icone(p.type, niveau.couleur) + "</div>" +
        '<div class="sim-alerte-textes">' +
        '<div class="sim-alerte-message" id="sim-alerte-message"></div>' +
        '<div class="sim-alerte-nom">' + p.nom + "</div>" +
        "</div>" +
        "</div>";
      sim.alerteAffichee = p.id;
    }

    var distBase = parseInt(p.distance, 10) || 200;
    var restant = Math.max(0, (actif.position - sim.pos) / portee) * distBase;
    var texte;
    if (restant <= 15) texte = type.libelle + " : c'est ici";
    else texte = type.libelle + " dans " + (Math.ceil(restant / 10) * 10) + " m";
    document.getElementById("sim-alerte-message").textContent = texte;
  }

  function majAffichage() {
    var indexRoute = indexFormeCourant();
    var indexEntier = Math.floor(indexRoute);
    var coordonnee = coordonneeCourante(indexRoute);

    if (carte) {
      var passe = TRAJET_48.coordinates.slice(0, indexEntier + 1).concat([coordonnee]);
      var reste = [coordonnee].concat(TRAJET_48.coordinates.slice(indexEntier + 1));
      sim.lignePassee.setLatLngs(passe);
      sim.ligneRestante.setLatLngs(reste);
      sim.marqueurBus.setLatLng(coordonnee);
      carte.panTo(coordonnee, { animate: false });

      var prochain = Math.min(Math.ceil(sim.pos + 0.001), sim.arrets.length - 1);
      sim.marqueursArrets.forEach(function (marqueur, index) {
        marqueur.setStyle({
          fillColor: index < prochain ? "#7d8796" : index === prochain ? "#ffffff" : "#7657ff",
          color: index === prochain ? "#7657ff" : "#ffffff",
          radius: index === prochain ? 7 : (index === 0 || index === sim.arrets.length - 1 ? 6 : 4)
        });
      });
    }

    var prochainIdx = Math.min(Math.ceil(sim.pos + 0.001), sim.arrets.length - 1);
    document.getElementById("sim-prochain-nom").textContent = sim.arrets[prochainIdx].nom;

    var prochaineManoeuvre = null;
    for (var m = 0; m < sim.manoeuvres.length; m++) {
      if (sim.manoeuvres[m].index > indexRoute + 2) {
        prochaineManoeuvre = sim.manoeuvres[m];
        break;
      }
    }
    var direction = document.getElementById("sim-direction");
    if (prochaineManoeuvre) {
      var distanceVirage = longueurForme(indexRoute, prochaineManoeuvre.index);
      direction.textContent = prochaineManoeuvre.symbole;
      if (sim.etat === "roulage") {
        var distanceTexte = distanceVirage < 40 ? "Maintenant" : "Dans " + (Math.ceil(distanceVirage / 10) * 10) + " m";
        majStatut(distanceTexte + ", tournez à " + prochaineManoeuvre.direction,
          "Puis continuez vers " + sim.arrets[prochainIdx].nom);
      }
    } else {
      direction.textContent = "↑";
    }

    var annonces = sim.points.filter(function (pt) { return pt.annonce; }).length;
    document.getElementById("sim-compteur").textContent =
      "Arrêt " + (Math.min(Math.floor(sim.pos) + 1, sim.arrets.length)) + " / " + sim.arrets.length +
      " · " + annonces + " / " + sim.points.length + " alertes annoncées";

    document.getElementById("sim-vitesse").innerHTML = Math.round(sim.vitesse) + "<small>km/h</small>";
    majAlerte();
  }

  /* fait avancer la physique du bus d'un petit pas de temps (dt en ms) */
  function simulerPas(dt) {
    var seg = Math.min(Math.floor(sim.pos), sim.nbSeg - 1);
    var s = sim.segments[seg];

    if (sim.etat === "feu" || sim.etat === "arret") {
      sim.attente -= dt;
      sim.vitesse = Math.max(0, sim.vitesse * 0.5 - 2);
      if (sim.attente <= 0) sim.etat = "roulage";
      return;
    }

    /* roulage */
    var rythme = 1 / s.duree;                 /* tronçons par ms */
    if (s.bouchon) rythme = rythme * 0.45;
    var avant = sim.pos;
    sim.pos += dt * rythme;

    var fraction = sim.pos - seg;
    var profil = Math.min(1, Math.sin(Math.PI * fraction) * 1.55);
    var cibleVitesse = Math.max(8, s.vitesseMax * profil);
    sim.vitesse = sim.vitesse * 0.85 + cibleVitesse * 0.15;

    /* marquer les alertes entrées dans la zone d'annonce, même si
       l'affichage n'a pas le temps de tourner à ce moment-là */
    sim.points.forEach(function (pt) {
      if (!pt.annonce && sim.pos >= pt.position - PORTEE_ANNONCE) pt.annonce = true;
    });

    /* un feu tricolore au milieu du tronçon */
    if (s.feu && !s.feu.fait && avant < seg + s.feu.position && sim.pos >= seg + s.feu.position) {
      sim.pos = seg + s.feu.position;
      s.feu.fait = true;
      sim.etat = "feu";
      sim.attente = s.feu.duree;
      return;
    }

    /* arrivée à l'arrêt suivant */
    var prochain = seg + 1;
    if (sim.pos >= prochain) {
      sim.pos = prochain;
      if (prochain >= sim.nbSeg) {
        sim.etat = "fini";
        sim.vitesse = 0;
        return;
      }
      if (sim.dessertes[prochain] > 0) {
        sim.etat = "arret";
        sim.attente = sim.dessertes[prochain];
      }
    }
  }

  function majTextesStatut() {
    if (sim.etat === "fini") {
      majStatut("Terminus : " + sim.arrets[sim.arrets.length - 1].nom,
        "Service terminé, toutes les alertes de la ligne ont été annoncées");
      document.getElementById("sim-pause").textContent = "Rejouer";
    } else if (sim.etat === "roulage") {
      var seg = Math.min(Math.floor(sim.pos), sim.nbSeg - 1);
      var versIdx = Math.min(seg + 1, sim.arrets.length - 1);
      majStatut("Suivez le tracé vers " + sim.arrets[versIdx].nom,
        sim.segments[seg].bouchon ? "Circulation dense, allure réduite" : "");
    } else if (sim.etat === "feu") {
      majStatut("Arrêté au feu tricolore", "Redémarrage dans un instant");
    } else if (sim.etat === "arret") {
      majStatut("Arrêt : " + sim.arrets[Math.round(sim.pos)].nom,
        "Montée et descente des voyageurs");
    }
  }

  function tickSimulation() {
    var maintenant = performance.now();
    /* temps réellement écoulé depuis le dernier calcul : si le navigateur
       a mis l'onglet en veille, on rattrape par petits pas pour que la
       démo reste juste, sans sauts incohérents */
    var ecoule = Math.min(maintenant - sim.dernierTick, 30000);
    sim.dernierTick = maintenant;

    if (sim.enPause || sim.etat === "fini") return;

    while (ecoule > 0 && sim.etat !== "fini") {
      var pas = Math.min(200, ecoule);
      simulerPas(pas * sim.mult);
      ecoule -= pas;
    }

    majTextesStatut();
    majAffichage();
  }

  function demarrerSimulation() {
    arreterSimulation();
    sim = preparerSimulation();
    initialiserCarte();
    majStatut("Départ : " + LIGNE.depart, "Prise de service, fermeture des portes");
    document.getElementById("sim-pause").textContent = "Pause";
    document.querySelectorAll(".btn-vitesse").forEach(function (b) {
      b.classList.toggle("actif", b.getAttribute("data-mult") === "1");
    });
    majAffichage();
    sim.timer = setInterval(tickSimulation, 100);
  }

  function arreterSimulation() {
    if (sim && sim.timer) clearInterval(sim.timer);
    if (sim) sim.timer = null;
  }

  document.getElementById("btn-simulation").addEventListener("click", function () {
    afficher("simulation");
    demarrerSimulation();
  });

  document.getElementById("sim-pause").addEventListener("click", function () {
    if (!sim) return;
    if (sim.etat === "fini") { demarrerSimulation(); return; }
    sim.enPause = !sim.enPause;
    this.textContent = sim.enPause ? "Reprendre" : "Pause";
  });

  document.querySelectorAll(".btn-vitesse").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!sim) return;
      sim.mult = parseInt(btn.getAttribute("data-mult"), 10);
      document.querySelectorAll(".btn-vitesse").forEach(function (b) {
        b.classList.toggle("actif", b === btn);
      });
    });
  });

  /* ---------- Démarrage ---------- */

  remplirAccueil();
  afficher("accueil");
})();

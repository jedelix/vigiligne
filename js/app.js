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

  /* ---------- Écran 5 : démo du service (simulation du trajet) ----------
     Le bus avance sur un chronomètre : il marque les arrêts, se bloque
     aux feux, ralentit dans la circulation dense. Rien n'est connecté
     au véhicule, tout est scénarisé pour rendre le temps réaliste. */

  var sim = null; // état de la simulation en cours (null si aucune)
  var PORTEE_ANNONCE = 1.1; // distance d'annonce d'une alerte, en tronçons

  function hasard(min, max) { return min + Math.random() * (max - min); }

  function preparerSimulation() {
    var arrets = LIGNE.arrets;
    var nbSeg = arrets.length - 1;

    /* scénario du trajet, tiré au sort à chaque lancement */
    var segments = [];
    for (var i = 0; i < nbSeg; i++) {
      segments.push({
        duree: hasard(11000, 16500),             /* ms de roulage sur le tronçon */
        bouchon: Math.random() < 0.16,           /* circulation dense sur ce tronçon */
        feu: Math.random() < 0.30 ? {            /* un feu tricolore en cours de tronçon */
          position: hasard(0.3, 0.7),
          duree: hasard(8000, 15000),
          fait: false
        } : null
      });
    }

    /* à quels arrêts le bus marque-t-il l'arrêt (voyageurs) */
    var dessertes = {};
    for (var j = 1; j < arrets.length; j++) {
      dessertes[j] = (j === arrets.length - 1) || Math.random() < 0.72
        ? hasard(6000, 10000) : 0;
    }

    /* position de chaque point de vigilance sur la piste */
    var points = LIGNE.points.slice().sort(function (a, b) { return a.ordre - b.ordre; })
      .map(function (p) {
        var idx = arrets.indexOf(p.arretRepere);
        if (idx < 0) idx = 0;
        var posPoint;
        if (idx === 0) posPoint = 0.3;
        else if (idx === arrets.length - 1) posPoint = idx - 0.5;
        else posPoint = idx - 0.35;
        return { donnees: p, position: posPoint, annonce: false };
      });

    return {
      arrets: arrets,
      nbSeg: nbSeg,
      segments: segments,
      dessertes: dessertes,
      points: points,
      pos: 0,
      etat: "arret",              /* on démarre à quai au terminus de départ */
      attente: 5000,
      mult: 1,
      enPause: false,
      vitesse: 0,
      alerteAffichee: null,
      dernierTick: performance.now(),
      timer: null
    };
  }

  /* espacement vertical entre deux arrêts du thermomètre, en pixels */
  var THERMO_ESPACEMENT = 46;
  var THERMO_MARGE = 26;

  function yArret(position) { return THERMO_MARGE + position * THERMO_ESPACEMENT; }

  function construireThermometre() {
    var inner = document.getElementById("sim-thermo-inner");
    var hauteurTotale = yArret(sim.nbSeg) + THERMO_MARGE;

    var html =
      '<div class="sim-thermo-ligne" style="top:' + yArret(0) + 'px;height:' + (sim.nbSeg * THERMO_ESPACEMENT) + 'px"></div>' +
      '<div class="sim-thermo-fait" id="sim-thermo-fait" style="top:' + yArret(0) + 'px;height:0px"></div>';

    for (var i = 0; i < sim.arrets.length; i++) {
      html +=
        '<div class="sim-thermo-arret" data-index="' + i + '" style="top:' + yArret(i) + 'px">' +
        '<span class="sim-thermo-dot"></span>' +
        '<span class="sim-thermo-nom">' + sim.arrets[i] + "</span>" +
        "</div>";
    }

    sim.points.forEach(function (pt) {
      html += '<span class="sim-thermo-point niveau-' + pt.donnees.niveau +
        '" style="top:' + yArret(pt.position) + 'px"></span>';
    });

    html += '<span class="sim-bus" id="sim-bus" style="top:' + yArret(0) + 'px">' +
      '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="15" rx="3" fill="#fff"/>' +
      '<rect x="7" y="6" width="10" height="5" rx="1" fill="#2f80ed"/>' +
      '<circle cx="8.5" cy="15" r="1.6" fill="#2f80ed"/><circle cx="15.5" cy="15" r="1.6" fill="#2f80ed"/></svg>' +
      "</span>";

    inner.innerHTML = html;
    inner.style.height = hauteurTotale + "px";
  }

  /* fait suivre la fenêtre du thermomètre autour du bus, comme
     l'écran de bord qui fait défiler les prochains arrêts */
  function majThermometre() {
    var conteneur = document.getElementById("sim-thermo");
    var inner = document.getElementById("sim-thermo-inner");
    var yBus = yArret(sim.pos);

    document.getElementById("sim-thermo-fait").style.height = (sim.pos * THERMO_ESPACEMENT) + "px";
    document.getElementById("sim-bus").style.top = yBus + "px";

    var hVue = conteneur.clientHeight;
    var hTotale = yArret(sim.nbSeg) + THERMO_MARGE;
    var decalage = 0;
    if (hTotale > hVue) {
      decalage = Math.min(0, Math.max(hVue - hTotale, hVue / 2 - yBus));
    }
    inner.style.transform = "translateY(" + decalage + "px)";

    var prochainIdx = Math.min(Math.ceil(sim.pos + 0.001), sim.arrets.length - 1);
    inner.querySelectorAll(".sim-thermo-arret").forEach(function (el) {
      var idx = parseInt(el.getAttribute("data-index"), 10);
      el.classList.toggle("passe", idx <= sim.pos + 0.001);
      el.classList.toggle("prochain", idx === prochainIdx && sim.etat !== "fini");
    });
  }

  function majStatut(titre, sousTitre) {
    document.getElementById("sim-etat").textContent = titre;
    document.getElementById("sim-sous-etat").textContent = sousTitre || "";
  }

  function majAlerte() {
    var zone = document.getElementById("sim-zone-alerte");
    var portee = PORTEE_ANNONCE;

    var actif = null;
    for (var i = 0; i < sim.points.length; i++) {
      var pt = sim.points[i];
      if (sim.pos <= pt.position + 0.15 && pt.position - sim.pos <= portee) { actif = pt; break; }
    }

    if (!actif) {
      if (sim.alerteAffichee !== "neutre") {
        zone.innerHTML = '<div class="sim-neutre">Aucun point de vigilance à l\'approche</div>';
        sim.alerteAffichee = "neutre";
      }
      return;
    }

    var p = actif.donnees;
    var niveau = NIVEAUX[p.niveau];
    var type = TYPES[p.type];
    actif.annonce = true;

    if (sim.alerteAffichee !== p.id) {
      zone.innerHTML =
        '<div class="sim-alerte fond-' + p.niveau + '">' +
        '<div class="sim-alerte-icone">' + icone(p.type, niveau.couleur) + "</div>" +
        '<div class="sim-alerte-message" id="sim-alerte-message"></div>' +
        '<div class="sim-alerte-nom">' + p.nom + "</div>" +
        '<span class="sim-alerte-niveau niveau-' + p.niveau + '">' + niveau.libelle + "</span>" +
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
    majThermometre();

    var annonces = sim.points.filter(function (pt) { return pt.annonce; }).length;
    document.getElementById("sim-compteur").textContent =
      "Arrêt " + (Math.min(Math.floor(sim.pos) + 1, sim.arrets.length)) + " / " + sim.arrets.length +
      " · " + annonces + " / " + sim.points.length + " alertes annoncées";

    document.getElementById("sim-vitesse").textContent = Math.round(sim.vitesse) + " km/h";
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

    var cibleVitesse = s.bouchon ? hasard(7, 13) : hasard(17, 31);
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
      majStatut("Terminus : " + sim.arrets[sim.arrets.length - 1],
        "Service terminé, toutes les alertes de la ligne ont été annoncées");
      document.getElementById("sim-pause").textContent = "Rejouer";
    } else if (sim.etat === "roulage") {
      var seg = Math.min(Math.floor(sim.pos), sim.nbSeg - 1);
      var versIdx = Math.min(seg + 1, sim.arrets.length - 1);
      majStatut("En direction de : " + sim.arrets[versIdx],
        sim.segments[seg].bouchon ? "Circulation dense, allure réduite" : "");
    } else if (sim.etat === "feu") {
      majStatut("Arrêté au feu tricolore", "Redémarrage dans un instant");
    } else if (sim.etat === "arret") {
      majStatut("Arrêt : " + sim.arrets[Math.round(sim.pos)],
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
    construireThermometre();
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

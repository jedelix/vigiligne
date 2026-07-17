/* ============================================================
   FICHIER DE DONNÉES DE LA LIGNE
   ============================================================

   Ce fichier contient tous les points de vigilance de la ligne.
   Il est fait pour être modifié par une personne non technique.

   IMPORTANT : le parcours et les arrêts de la ligne 48 sont réels
   (source : RATP, juillet 2026). Les points de vigilance, eux, sont
   des DONNÉES DE TEST plausibles : Laetitia les remplacera par ses
   vraies observations de terrain.

   COMMENT MODIFIER :
   - Chaque point est un bloc entre accolades { ... } suivi d'une virgule.
   - Modifiez uniquement le texte entre guillemets "comme ceci".
   - Ne supprimez pas les virgules ni les guillemets.
   - Pour ajouter un point : copiez un bloc entier { ... }, collez-le
     à la suite, et changez son contenu (pensez à changer "ordre").

   VALEURS POSSIBLES pour "type" (choisir exactement une) :
     "rond-point"      : rond-point ou giratoire serré
     "pont-bas"        : pont bas ou hauteur limitée
     "gabarit-etroit"  : passage étroit pour un véhicule large
     "travaux"         : zone de travaux
     "virage"          : virage difficile
     "arret-delicat"   : arrêt ou manoeuvre compliqués
     "zone-ecole"      : zone scolaire
     "zone-pietonne"   : zone piétonne ou forte présence de piétons

   VALEURS POSSIBLES pour "niveau" (choisir exactement une) :
     "standard"  : vigilance standard (jaune)
     "renforcee" : vigilance renforcée (orange)
     "critique"  : vigilance critique (rouge)

   AUTRES CHAMPS :
   "distance"   : la distance d'annonce affichée dans la vision future
                  (exemple d'alerte embarquée), par exemple "200 m".
   "conseil"    : facultatif. Laissez "" (guillemets vides) s'il n'y en a pas.
                  Un conseil de manoeuvre doit être validé par un formateur
                  avant diffusion réelle.
   "temporaire" : true si le danger est provisoire (travaux par exemple),
                  false s'il est permanent (pont bas, virage).
   "source"     : qui a signalé ce point et son statut de validation.
   "arretRepere": le nom de l'arrêt le plus proche du point, recopié
                  EXACTEMENT depuis la liste "arrets" ci-dessous.
                  Sert à placer le point sur la ligne pendant la
                  démo du service.

   CHAMPS PRÉVUS POUR PLUS TARD (ne pas remplir pour l'instant) :
   - une photo du point ("photo") pour le reconnaître visuellement
   - le sens du trajet, quand la ligne existera dans les deux sens
   ============================================================ */

const LIGNE = {
  id: "ligne-48",
  nom: "Ligne 48",
  depart: "Gare du Nord",
  terminus: "Romainville - Vassou",

  /* Les arrêts réels de la ligne, dans l'ordre (source : RATP). */
  arrets: [
    "Gare du Nord",
    "Cail - Demarquay",
    "Place de la Chapelle",
    "Philippe de Girard",
    "Chapelle - Caillié / Château Landon",
    "Quai de la Seine - Stalingrad",
    "Jaurès",
    "Rue de Meaux",
    "Armand Carrel - Mairie du 19ème",
    "Manin",
    "Botzaris",
    "Place des Fêtes",
    "Louise Thuliez",
    "Pré-Saint-Gervais - Allés",
    "Mouzaïa / Pré-Saint-Gervais",
    "Rue des Bois",
    "Hôpital Robert Debré",
    "Les Marronniers",
    "Jean Jaurès - Belvédère",
    "René Fonck",
    "Porte des Lilas - Métro",
    "Mairie des Lilas",
    "Les Sablons",
    "Paul de Kock",
    "Les Bruyères",
    "Maréchal Juin",
    "Fort de Romainville / Paul Doumer",
    "Gagarine",
    "Romainville - Vassou"
  ],

  points: [
    {
      id: "p1",
      ordre: 1,
      nom: "Sortie du terminus Gare du Nord",
      localisation: "Rue de Dunkerque, au départ de l'arrêt Gare du Nord",
      type: "arret-delicat",
      niveau: "renforcee",
      distance: "100 m",
      anticiper: "Flux continu de piétons devant la gare, taxis et VTC en double file. Des voyageurs traversent entre les véhicules avec des bagages.",
      conseil: "Allure au pas tant que le parvis n'est pas dégagé, contrôler les deux rétroviseurs avant chaque réinsertion.",
      temporaire: false,
      arretRepere: "Gare du Nord",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p2",
      ordre: 2,
      nom: "Place de la Chapelle, sous le métro aérien",
      localisation: "Carrefour La Chapelle, entre les arrêts Cail - Demarquay et Place de la Chapelle",
      type: "virage",
      niveau: "critique",
      distance: "200 m",
      anticiper: "Virage sous le viaduc du métro : les piliers réduisent la visibilité et le rayon de giration. Piétons très nombreux qui traversent hors des passages.",
      conseil: "Engager le virage lentement et large, l'arrière du bus passe près du pilier côté droit.",
      temporaire: false,
      arretRepere: "Place de la Chapelle",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p3",
      ordre: 3,
      nom: "Rue Philippe de Girard",
      localisation: "Entre les arrêts Philippe de Girard et Chapelle - Caillié",
      type: "gabarit-etroit",
      niveau: "renforcee",
      distance: "150 m",
      anticiper: "Rue étroite avec stationnement et livraisons fréquentes en double file. Le croisement avec un autre véhicule large demande de l'anticipation.",
      conseil: "Repérer les zones de dégagement avant de s'engager, ne pas se laisser presser par les véhicules suiveurs.",
      temporaire: false,
      arretRepere: "Philippe de Girard",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p4",
      ordre: 4,
      nom: "Place de Stalingrad",
      localisation: "Arrêt Quai de la Seine - Stalingrad, au pied de la Rotonde",
      type: "zone-pietonne",
      niveau: "renforcee",
      distance: "250 m",
      anticiper: "Esplanade très fréquentée : piétons et trottinettes coupent la trajectoire du bus, pistes cyclables à double sens de chaque côté du carrefour.",
      conseil: "Vérifier les cyclistes dans l'angle mort droit avant chaque redémarrage.",
      temporaire: false,
      arretRepere: "Quai de la Seine - Stalingrad",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p5",
      ordre: 5,
      nom: "Montée de la rue Botzaris",
      localisation: "Le long du parc des Buttes-Chaumont, entre les arrêts Manin et Botzaris",
      type: "virage",
      niveau: "standard",
      distance: "200 m",
      anticiper: "Montée en courbe le long du parc. Aux beaux jours, familles et joggeurs sortent du parc directement sur la chaussée.",
      conseil: "",
      temporaire: false,
      arretRepere: "Botzaris",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p6",
      ordre: 6,
      nom: "Giratoire de la place des Fêtes",
      localisation: "Arrêt Place des Fêtes",
      type: "rond-point",
      niveau: "critique",
      distance: "200 m",
      anticiper: "Giratoire compact avec traversées piétonnes sur chaque branche. Le marché (mardi, vendredi, dimanche matin) ajoute des livraisons et des piétons chargés.",
      conseil: "Prendre le giratoire au pas, l'arrière balaie le passage piéton à la sortie.",
      temporaire: false,
      arretRepere: "Place des Fêtes",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p7",
      ordre: 7,
      nom: "Traversée du quartier de la Mouzaïa",
      localisation: "Entre les arrêts Mouzaïa / Pré-Saint-Gervais et Rue des Bois",
      type: "gabarit-etroit",
      niveau: "critique",
      distance: "150 m",
      anticiper: "Rues résidentielles très étroites pour un bus standard : stationnement des deux côtés, croisement impossible par endroits.",
      conseil: "En cas de croisement avec un autre bus, celui qui monte a la priorité d'usage sur cette section, se référer à la consigne d'exploitation.",
      temporaire: false,
      arretRepere: "Mouzaïa / Pré-Saint-Gervais",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p8",
      ordre: 8,
      nom: "Dépose de l'hôpital Robert Debré",
      localisation: "Boulevard Sérurier, arrêt Hôpital Robert Debré",
      type: "arret-delicat",
      niveau: "renforcee",
      distance: "100 m",
      anticiper: "Arrêt en pente, très fréquenté par des familles avec poussettes et des personnes à mobilité réduite. Ambulances et taxis stationnent parfois sur le quai bus.",
      conseil: "Accoster au plus près du trottoir et laisser le temps nécessaire à la montée, ne pas repartir avant stabilisation complète.",
      temporaire: false,
      arretRepere: "Hôpital Robert Debré",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p9",
      ordre: 9,
      nom: "Chantier de la porte des Lilas",
      localisation: "Traversée de la porte des Lilas, arrêt Porte des Lilas - Métro",
      type: "travaux",
      niveau: "renforcee",
      distance: "300 m",
      anticiper: "Exemple de signalement provisoire : emprise de chantier sur le carrefour, voie de droite neutralisée et cheminement piéton dévié sur la chaussée.",
      conseil: "",
      temporaire: true,
      arretRepere: "Porte des Lilas - Métro",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p10",
      ordre: 10,
      nom: "Écoles de la rue de Paris aux Lilas",
      localisation: "Entre les arrêts Mairie des Lilas et Les Sablons",
      type: "zone-ecole",
      niveau: "critique",
      distance: "250 m",
      anticiper: "Plusieurs établissements scolaires en bord de chaussée. Aux heures d'entrée et de sortie, enfants qui traversent en dehors des passages et parents en double file.",
      conseil: "Réduire fortement l'allure aux créneaux 8h à 8h45, 11h30 à 13h45 et 16h15 à 17h.",
      temporaire: false,
      arretRepere: "Mairie des Lilas",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    },
    {
      id: "p11",
      ordre: 11,
      nom: "Retournement du terminus Romainville - Vassou",
      localisation: "Arrêt Romainville - Vassou",
      type: "arret-delicat",
      niveau: "standard",
      distance: "100 m",
      anticiper: "Manoeuvre de retournement au terminus sur un espace partagé avec du stationnement résidentiel.",
      conseil: "",
      temporaire: false,
      arretRepere: "Romainville - Vassou",
      source: "Donnée de test, à remplacer par l'observation terrain et à faire valider par un formateur"
    }
  ]
};

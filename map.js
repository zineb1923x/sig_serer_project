require([
    "esri/Map",
    "esri/views/MapView",
    "esri/config",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/widgets/Measurement",
    "esri/widgets/Sketch",
    "esri/geometry/Point",
    "esri/Graphic"
  ], function (
    Map, MapView, esriConfig, FeatureLayer, GraphicsLayer,
    BasemapToggle, Legend, Search, Measurement, Sketch,
    Point, Graphic
  ) {
    // *** IMPORTANT *** : Assurez-vous de placer votre clé API AVANT de créer la carte
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurK-SKzm6kDxMpaku0X0M0_cXYuL674n80gC4uwVQstAa7TQVd8EgwsvaQ7Gp08LZUxWdSmoi1c8VQdI1t9OgbDRN3HzxlIz99o-OFPH0dq-khb9KmeeJKtNQDVy6FprLlX-qLG-An6XW1_cAzXxF5rjNFCn4kxmVsxWJLX9M20u6rcmtYs_-9N3SRoJ9wKeoaA..AT1_KaYR8biH";
  
    // ========================= 1. Initialisation de la carte et des Widgets =========================
    var map = new Map({
      basemap: "streets" // Fond de carte par défaut
    });
  
    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-7.62, 33.59],
      zoom: 12
    });
  
    // BasemapToggle (pour changer de fond de carte, ici vers "arcgis-imagery")
    var basemapToggle = new BasemapToggle({
      view: view,
      nextBasemap: "arcgis-imagery"
    });
    view.ui.add(basemapToggle, "bottom-right");
  
    // Légende
    var legend = new Legend({ view: view });
    view.ui.add(legend, "bottom-left");
  
    // Widget Search
    var searchWidget = new Search({ view: view });
    view.ui.add(searchWidget, "top-left");
  
    // Outil de mesure
    var measurement = new Measurement({ view: view });
    view.ui.add(measurement, "top-right");
  
    // ========================= 2. Ajout des couches principales =========================
    // 2.1. Couche Communes (surfacique)
    var communesLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/5",
      outFields: ["PREFECTURE", "COMMUNE_AR", "Shape_Area"],
      popupTemplate: {
        title: "<b>Commune: {COMMUNE_AR}</b>",
        content: "<p>Préfecture : {PREFECTURE}</p><p>Surface : {Shape_Area}</p>"
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [51, 51, 204, 0.5],
          style: "solid",
          outline: { color: "white", width: 1 }
        }
      }
    });
    map.add(communesLayer);
  
    // 2.2. Couche Voirie (linéaire)
    var voirieLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/4",
      outFields: ["NOM", "LENGTH"],
      popupTemplate: {
        title: "Voirie de Casablanca",
        content: [{
          type: "fields",
          fieldInfos: [
            { fieldName: "NOM", label: "Nom de la voie", visible: true },
            { fieldName: "LENGTH", label: "Longueur", visible: true, format: { places: 1, digitSeparator: true } }
          ]
        }]
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-line",
          color: "black",
          width: "2px",
          style: "short-dot"
        }
      }
    });
    map.add(voirieLayer);
  
    // 2.3. Couche Population (ponctuelle)
    var populationLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/0",
      outFields: ["TOTAL1994", "TOTAL2004", "ARRONDISSE"],
      popupTemplate: {
        title: "<b>Population de : {ARRONDISSE}</b>",
        content: "<p>Total 1994 : {TOTAL1994}</p><p>Total 2004 : {TOTAL2004}</p>"
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-marker",
          size: 6,
          color: "green",
          outline: { width: 0.5, color: "white" }
        }
      }
    });
    map.add(populationLayer);
  
    // 2.4. Couche Hôtels (ponctuelle)
    var hotelsLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/2",
      outFields: ["NOM", "CATEGORIE"],
      popupTemplate: {
        title: "Hôtel: {NOM}",
        content: "<p>Catégorie: {CATEGORIE}</p>"
      }
    });
    map.add(hotelsLayer);
  
    // 2.5. Couche Grandes Surfaces (ponctuelle)
    var surfacesLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/1",
      outFields: ["NOM", "TYPE"],
      popupTemplate: {
        title: "Grande surface: {NOM}",
        content: "<p>Type: {TYPE}</p>"
      }
    });
    map.add(surfacesLayer);
  
    // 2.6. Couche Centres de Formation Supérieurs (ponctuelle)
    // Remplacez le "?" par le numéro de service correct ou laissez-la en commentaire si non disponible
    var centresLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/6",
      outFields: ["NOM", "ADRESSE"],
      popupTemplate: {
        title: "Centre de formation: {NOM}",
        content: "<p>Adresse: {ADRESSE}</p>"
      }
    });
    // map.add(centresLayer);
  
    // ========================= 3. Symbologie de la Population =========================
    var rendererPop2004 = {
      type: "class-breaks",
      field: "TOTAL2004",
      classBreakInfos: [
        { minValue: 0, maxValue: 20000, symbol: { type: "simple-marker", size: 8, color: "#ffffcc" }, label: "0 - 20k" },
        { minValue: 20000, maxValue: 50000, symbol: { type: "simple-marker", size: 10, color: "#c2e699" }, label: "20k - 50k" },
        { minValue: 50000, maxValue: 100000, symbol: { type: "simple-marker", size: 12, color: "#78c679" }, label: "50k - 100k" },
        { minValue: 100000, maxValue: 200000, symbol: { type: "simple-marker", size: 14, color: "#31a354" }, label: "100k - 200k" },
        { minValue: 200000, maxValue: Infinity, symbol: { type: "simple-marker", size: 16, color: "#006837" }, label: "> 200k" }
      ]
    };
  
    var rendererPop1994 = {
      type: "class-breaks",
      field: "TOTAL1994",
      classBreakInfos: [
        { minValue: 0, maxValue: 15000, symbol: { type: "simple-marker", size: 8, color: "#fee5d9" }, label: "0 - 15k" },
        { minValue: 15000, maxValue: 40000, symbol: { type: "simple-marker", size: 10, color: "#fcae91" }, label: "15k - 40k" },
        { minValue: 40000, maxValue: 80000, symbol: { type: "simple-marker", size: 12, color: "#fb6a4a" }, label: "40k - 80k" },
        { minValue: 80000, maxValue: 120000, symbol: { type: "simple-marker", size: 14, color: "#de2d26" }, label: "80k - 120k" },
        { minValue: 120000, maxValue: Infinity, symbol: { type: "simple-marker", size: 16, color: "#a50f15" }, label: "> 120k" }
      ]
    };
  
    var rendererDiagram = {
      type: "simple",
      symbol: {
        type: "simple-marker",
        size: 10,
        color: "orange",
        outline: { width: 1, color: "white" }
      }
    };
  
    // Menu de sélection pour l'affichage de la couche Population
    var popDisplaySelect = document.createElement("select");
    popDisplaySelect.className = "filterSelect widgetContainer";
    var optSimple = document.createElement("option");
    optSimple.value = "simple";
    optSimple.innerHTML = "Population (mode simple)";
    popDisplaySelect.appendChild(optSimple);
    var opt2004 = document.createElement("option");
    opt2004.value = "pop2004";
    opt2004.innerHTML = "Population 2004 (5 classes)";
    popDisplaySelect.appendChild(opt2004);
    var opt1994 = document.createElement("option");
    opt1994.value = "pop1994";
    opt1994.innerHTML = "Population 1994 (5 classes)";
    popDisplaySelect.appendChild(opt1994);
    var optDiagram = document.createElement("option");
    optDiagram.value = "diagram";
    optDiagram.innerHTML = "Population 1994/2004 (diagramme)";
    popDisplaySelect.appendChild(optDiagram);
    view.ui.add(popDisplaySelect, "top-right");
  
    popDisplaySelect.addEventListener("change", function (e) {
      var mode = e.target.value;
      switch (mode) {
        case "pop2004":
          populationLayer.renderer = rendererPop2004;
          populationLayer.popupTemplate = {
            title: "<b>Population de : {ARRONDISSE}</b>",
            content: "<p>Total 2004 : {TOTAL2004}</p>"
          };
          break;
        case "pop1994":
          populationLayer.renderer = rendererPop1994;
          populationLayer.popupTemplate = {
            title: "<b>Population de : {ARRONDISSE}</b>",
            content: "<p>Total 1994 : {TOTAL1994}</p>"
          };
          break;
        case "diagram":
          populationLayer.renderer = rendererDiagram;
          populationLayer.popupTemplate = {
            title: "<b>Population de : {ARRONDISSE}</b>",
            content: [{
              type: "media",
              mediaInfos: [{
                type: "column-chart",
                caption: "Comparaison 1994 vs 2004",
                value: { fields: ["TOTAL1994", "TOTAL2004"] }
              }]
            }]
          };
          break;
        default:
          populationLayer.renderer = {
            type: "simple",
            symbol: {
              type: "simple-marker",
              size: 6,
              color: "green",
              outline: { width: 0.5, color: "white" }
            }
          };
          populationLayer.popupTemplate = {
            title: "<b>Population de : {ARRONDISSE}</b>",
            content: "<p>Total 1994 : {TOTAL1994}</p><p>Total 2004 : {TOTAL2004}</p>"
          };
          break;
      }
    });
  
    // ========================= 4. Requêtes et filtres =========================
    // 4.1. Filtrage de la couche Communes
    var communesFilterSelect = document.createElement("select");
    communesFilterSelect.className = "filterSelect widgetContainer";
    var optCommDefault = document.createElement("option");
    optCommDefault.value = "";
    optCommDefault.innerHTML = "Filtrer Communes";
    communesFilterSelect.appendChild(optCommDefault);
    var filtresCommunes = [
      "PREFECTURE = 'CASABLANCA'",
      "COMMUNE_AR = 'CENTRE'",
      "Shape_Area < 8000000"
    ];
    filtresCommunes.forEach(function(filtre) {
      var opt = document.createElement("option");
      opt.value = filtre;
      opt.innerHTML = filtre;
      communesFilterSelect.appendChild(opt);
    });
    view.ui.add(communesFilterSelect, "top-left");
    communesFilterSelect.addEventListener("change", function(e) {
      communesLayer.definitionExpression = e.target.value;
    });
  
    // 4.2. Filtrage de la couche Hôtels par catégorie
    var hotelsSelect = document.createElement("select");
    hotelsSelect.className = "filterSelect widgetContainer";
    var hotelsDefault = document.createElement("option");
    hotelsDefault.value = "";
    hotelsDefault.innerHTML = "Filtrer Hôtels par catégorie";
    hotelsSelect.appendChild(hotelsDefault);
    var categories = ["1*", "2*", "3*", "4*", "5*"];
    categories.forEach(function(cat) {
      var opt = document.createElement("option");
      opt.value = "CATEGORIE = '" + cat + "'";
      opt.innerHTML = cat;
      hotelsSelect.appendChild(opt);
    });
    view.ui.add(hotelsSelect, "top-left");
    hotelsSelect.addEventListener("change", function(e) {
      hotelsLayer.definitionExpression = e.target.value;
    });
  
    // 4.3. Filtrage de la couche Grandes Surfaces par type
    var surfacesSelect = document.createElement("select");
    surfacesSelect.className = "filterSelect widgetContainer";
    var surfacesDefault = document.createElement("option");
    surfacesDefault.value = "";
    surfacesDefault.innerHTML = "Filtrer Grandes Surfaces par type";
    surfacesSelect.appendChild(surfacesDefault);
    var types = ["Marjane", "Acima", "Autre"];
    types.forEach(function(type) {
      var opt = document.createElement("option");
      opt.value = "TYPE = '" + type + "'";
      opt.innerHTML = type;
      surfacesSelect.appendChild(opt);
    });
    view.ui.add(surfacesSelect, "top-left");
    surfacesSelect.addEventListener("change", function(e) {
      surfacesLayer.definitionExpression = e.target.value;
    });
  
    // ========================= 5. Edition des données – Gestion des réclamations =========================
    var reclamationLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/V5C3rxtMTm0brojN/arcgis/rest/services/Projet_1/FeatureServer/3",
      outFields: ["Objet", "Message", "Email"],
      popupTemplate: {
        title: "{Objet}",
        content: "<p>{Message}</p><p>Email: {Email}</p>"
      }
    });
    // Utilisation d'une GraphicsLayer pour l'édition manuelle
    var reclamationGraphics = new GraphicsLayer();
    map.add(reclamationGraphics);
  
    // Widget Sketch pour l'édition des réclamations
    var sketch = new Sketch({
      view: view,
      layer: reclamationGraphics
    });
    view.ui.add(sketch, "top-left");
  
    // Mise à jour de la liste des réclamations affichées dans le panneau
    function updateReclamationsList() {
      var ul = document.getElementById("reclamationsUl");
      ul.innerHTML = "";
      reclamationGraphics.graphics.forEach(function (graphic, index) {
        var li = document.createElement("li");
        li.innerHTML = graphic.attributes.Objet ? graphic.attributes.Objet : "Réclamation " + (index + 1);
        ul.appendChild(li);
      });
    }
    reclamationGraphics.watch("graphics", updateReclamationsList);
  
    // Exemple : Ajout d'une réclamation par défaut
    var recPoint = new Point({ longitude: -7.62, latitude: 33.59 });
    var recSymbol = {
      type: "simple-marker",
      style: "diamond",
      color: "red",
      size: "10px",
      outline: { color: "black", width: 1 }
    };
    var recGraphic = new Graphic({
      geometry: recPoint,
      symbol: recSymbol,
      attributes: {
        Objet: "Réclamation Exemple",
        Message: "Description de la réclamation",
        Email: "contact@example.com"
      },
      popupTemplate: {
        title: "{Objet}",
        content: "<p>{Message}</p><p>Email: {Email}</p>"
      }
    });
    reclamationGraphics.add(recGraphic);
  
    // ========================= 6. (Optionnel) Requête SQL sur la couche Communes =========================
    var sqlQueries = [
      "-- Critère de recherche --",
      "PREFECTURE = 'CASABLANCA'",
      "COMMUNE_AR = 'CENTRE'",
      "Shape_Area > 8000000"
    ];
    var sqlSelect = document.createElement("select");
    sqlSelect.className = "filterSelect widgetContainer";
    sqlQueries.forEach(function(query) {
      var opt = document.createElement("option");
      opt.value = query;
      opt.innerHTML = query;
      sqlSelect.appendChild(opt);
    });
    view.ui.add(sqlSelect, "top-left");
    sqlSelect.addEventListener("change", function(e) {
      communesLayer.definitionExpression = e.target.value;
    });
  });
  
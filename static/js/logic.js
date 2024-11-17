let myMap = L.map('map').setView([37.77, -122.42], 4);

let grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>'
});

let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
});

let outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

grayscale.addTo(myMap);

let earthquakeLayer = L.layerGroup();
let tectonicLayer = L.layerGroup();

let baseMaps = {
    "Grayscale": grayscale,
    "Satellite": satellite,
    "Outdoors": outdoors
};

let overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicLayer
};

L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: false
}).addTo(myMap);

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(url).then(function(data) {
    console.log(data);

    data.features.forEach(function(feature) {
        let magnitude = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
        let latitude = feature.geometry.coordinates[1];
        let longitude = feature.geometry.coordinates[0];

        let markerSize = magnitude * 5;
        let color = getColor(depth);

        L.circleMarker([latitude, longitude], {
            radius: markerSize,
            fillColor: color,
            color: 'black',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        })
        .bindPopup("<b>Magnitude:</b> " + magnitude + "<br><b>Depth:</b> " + depth + " km<br><b>Location:</b> " + feature.properties.place)
        .addTo(earthquakeLayer);
    });

    earthquakeLayer.addTo(myMap);

    function getColor(depth) {
        if (depth <= 10) return '#90EE90';
        if (depth <= 30) return '#ADFF2F';
        if (depth <= 50) return '#FFD700';
        if (depth <= 70) return '#FF8C00';
        if (depth <= 90) return '#FF7F50';
        return '#FF0000';
    }

    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            depthRanges = [0, 10, 30, 50, 70, 90],
            colors = ['#90EE90', '#ADFF2F', '#FFD700', '#FF8C00', '#FF7F50', '#FF0000'];

        for (let i = 0; i < depthRanges.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' + 
                depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] : '') + '<br>';
        }
        return div;
    };

    legend.addTo(myMap);
    
}).catch(function(error) {
    console.log("Error loading data:", error);
});

//--------------------------------PART TWO----------------------------------\\

let tectoUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectoUrl).then(function(tectoData) {
    console.log(tectoData);

    L.geoJSON(tectoData, {
        color: "#ff7800",
        weight: 2,
        opacity: 1
    }).addTo(tectonicLayer);
}).catch(function(error) {
    console.log("Error loading tectonic data:", error);
});
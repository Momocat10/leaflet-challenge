let map;
let markers = [];

function initializeMap() {
    // Create the map
    map = L.map('map').setView([37.7749, -122.4194], 5); // Centered on San Francisco with zoom level 5

    // Add the tile layer (background map image)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function updateMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Process earthquake data
    window.earthquakeData.features.forEach(feature => {
        let coords = feature.geometry.coordinates;
        let magnitude = feature.properties.mag;
        let depth = coords[2];

        // Determine marker color based on depth
        let color = "";
        if (depth > 90) {
            color = "#ea2c2c";
        } else if (depth > 70) {
            color = "#ea822c";
        } else if (depth > 50) {
            color = "#ee9c00";
        } else if (depth > 30) {
            color = "#eecc00";
        } else if (depth > 10) {
            color = "#d4ee00";
        } else {
            color = "#98ee00";
        }

        // Create a circle marker
        let marker = L.circleMarker([coords[1], coords[0]], {
            radius: magnitude * 10,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}<br>Depth: ${depth} km<br>${new Date(feature.properties.time)}</p>`);

        // Add marker to map
        marker.addTo(map);
        markers.push(marker);
    });

    // Add legend
    addLegend();
}

function addLegend() {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let grades = [0, 10, 30, 50, 70, 90];
        let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
}

// Fetch and visualize earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson').then(data => {
    initializeMap();
    window.earthquakeData = data; // Store data globally for access in updateMap function
    updateMap();
});

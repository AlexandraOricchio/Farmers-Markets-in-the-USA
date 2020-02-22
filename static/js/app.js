// =================== Create Markers Function =======================
// function createMarkers(data) {
//     var coordinateMarkers = [];

//     for (var index=0; index<data.length; index++) {
//         var market = data[index];
//         var marketMarker = L.marker([market.y, market.x])
//         coordinateMarkers.push(marketMarker);
//     };
//     coordinateMarkers.forEach(function(m) {
//         m.addTo(myMap);
//     });
// }

// d3.json("json").then(function(data) {
//     // console.log(data);
//     data.forEach(function(d,i) {
//         d.x = +d.x;
//         d.y = +d.y;
//         // create dict of states & market counts
//         if(!counts[d.state]) {
//             counts[d.state] = 1;
//         }
//         else counts[d.state] = ++counts[d.state];
//     });
//     // createMarkers(data);
// });


// =========================== MAP =======================================
// create map object
var myMap = L.map('map', {
    center: [37.09, -95.71],
    zoom: 5
});

// add tile layer to the map
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
}).addTo(myMap);

// helpful color scale link: http://colorbrewer2.org/#type=sequential&scheme=BuGn&n=8
function getColor(d) {
    return d > 8 ? '#00441b' :
        d > 7 ? '#006d2c' :
        d > 6 ? '#238b45' :
        d > 5 ? '#41ae76' :
        d > 4 ? '#66c2a4' :
        d > 3 ? '#99d8c9' :
        d > 2 ? '#ccece6' :
        d > 1 ? '#e5f5f9' :
            '#f7fcfd';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.marketsPerCap),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// ================= HOVER FUNCTIONS ===================================
// making our GeoJSON layer accessibe through a variable before our listeners
var geojson;

// function defining an event listener for layer mouseover event 
function highlightFeature(e) {
    // get access to the layer that was hovered over
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#fed976',
        dashArray: '',
        fillOpacity: 0.7
    });
    // bringing thick border highlight effect on the layer to the front
    // (except on certain browsers that have problems doing bringtofront on mouseovers)
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    // updating control based on state mouse is hovered over
    info.update(layer.feature.properties);
}

// function to handle mouseout on state
function resetHighlight(e) {
    // geojson.resetStyle will reset the layer style to its defaul which we've defined in our style function
    geojson.resetStyle(e.target);
    // updating control back to neutral 
    info.update();
}

// function to handle zoom when click on state
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
// }

// function to add listeners to layers
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
        // click: zoomToFeature
    });
}

//===================== INFO CONTROL =================
var info = L.control();

// creating a div with class "info"
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

// updates the control based on feature properties passed 
info.update = function (props) {
    this._div.innerHTML = '<h4>US Farmers Markets</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.markets + ' Markets' + '<br/>' + Math.round(props.marketsPerCap) + ' Markets per 100,000'
        : 'Hover over a state');
};

// adding control to map
info.addTo(myMap);

// ==================== LEGEND ===============================
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
        labels = [];
    var legendInfo= '<h4>Markets <br/> Per 100,000</h4>'
    div.innerHTML = legendInfo;

    // loop through our per 100k intervals & generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

// add legend to map
legend.addTo(myMap);


d3.json("geojson").then(function(data) {
    // console.log(data);
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature}).addTo(myMap);
 
});
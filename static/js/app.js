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
    zoom: 4
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
    this._div.innerHTML = '<h5>US Farmers Markets</h5>' +  (props ?
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
    var legendInfo= '<h5>Markets <br/> Per 100,000</h5>'
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

// function marketTable(dict) {
//     for (var i=0, i>)
// }


// var mything;

// geojson promie
d3.json("geojson").then(function(data) {
    // console.log(data.features);
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature}).addTo(myMap);
    
    geojson.eachLayer(function (layer) {
        layer._path.id = layer.feature.properties.name;
        // layerbound = layer.getBounds();
        });

    // event listener for drop down selection
    const select = document.querySelector('.form-control');
    select.addEventListener('change', stateZoom);

    // state dropdown handler function
    function stateZoom(e) {
        state=e.target.value;
        var table = d3.select("#market-table");
        var tbody = table.select("tbody");
        tbody.html("");
        geojson.eachLayer(function (layer) {
            if (layer.feature.properties.name == state) {
                myMap.fitBounds(layer.getBounds());
                var markets_dicts = layer.feature.properties.market_list;
                // console.log(markets_dicts);
                markets_dicts.forEach(function(dict) {
                    var mar_lat=dict.y;
                    var mar_lon=dict.x;
                    var mar_name=dict.marketname;
                    var mar_city=dict.city;
                    if (mar_lat != null || mar_lon != null) {
                        var marketMarker= L.marker([mar_lat, mar_lon]);
                        marketMarker.addTo(myMap);
                        var row = tbody.append("tr");
                        var cell = row.append("td").text(`${mar_name}`);
                    }
                });
            }
        });
    }

    // event listener for table
    const table = document.querySelector('#market-table');
    table.addEventListener('click', marketlisting);

    // market table click handler function
    function marketlisting(e) {
        name = e.target.value;
        console.log(name);
    }

    

    // mything=data.features;
});

// ==================== CHARTS =================================================================
// ==================== Arrays of all products and payment types ====================
var paymentOptions = ["credit","wic","wiccash","sfmnp","snap"];
var products = ["bakedgoods","cheese","crafts","flowers","eggs","seafood","herbs","vegetables","honey",
"jams","maple","meat","nursery","nuts","plants","poultry","prepared","soap","trees","wine","coffee","beans",
"fruits","grains","juices","mushrooms","petfood","tofu","wildharvested"];

// var pColors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"];
// var paymentOptionsColors = {};
// paymentOptions.forEach(([d, i]) => paymentOptionsColors[d] = pColors[i]);

// svg container
var svgHeight = 600;
var svgWidth = 1000;

// margins
var margin = {
  top: 30,
  right: 30,
  bottom: 50,
  left: 50
};

// chart area minus margins
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3.select(".graph").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

chartGroup.attr("fill", "white");

// function newScale(data, chosenAxis, xy, scaleType) 
// {
//     let theRange = xy === "x" ? [0, chartWidth] : [chartHeight, 0];
//     // create scales
//     if (scaleType === "linear")
//     {
//         let theScale = d3.scaleLinear()
//             .domain([0, d3.max(data, d => d[chosenAxis])*1.1])
//             .range(theRange);
//         return theScale;
//     }
//     else if (scaleType === "band")
//     {
//         let theScale = d3.scaleBand()
//             .domain(data.map(d => d[chosenAxis]))
//             .range(theRange)
//             .padding(0.1);
//         return theScale;
//     }
// }

d3.json("json").then(function(data) {
    // create functions to pull data needed 

    // productCounts is an array of objects for each product, where each object contains the total number 
    // of markets each product is sold in and the total number of markets accepting each payment type for that
    // product.
    let productCounts = [];
    products.forEach(p => {
        let product = {};
        product["product"] = p;
        let productData = data.filter(d => d[p] === "Y");
        product["markets"] = productData.length;
        paymentOptions.forEach(payment => {
            product[payment] = productData.filter(d => d[payment] === "Y").length;
        });
        productCounts.push(product);
    });
    productCounts.sort((a,b) => b["markets"] - a["markets"]);

    console.log(productCounts);

    var color = d3.scaleOrdinal()
        .domain(paymentOptions)
        .range(d3.schemePaired);
    console.log(d3.schemePaired);
    // for creating stacked bar charts
    let stackedData = d3.stack()
        .keys(paymentOptions)(productCounts)

    stackedData.forEach(d => d.sort((a,b) => b.data.markets - a.data.markets));
    // console.log(stackedData);

    // Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
    // let xBandScale = newScale(productCounts, "product", "x", "band")
    // sorting matters here
    let xBandScale = d3.scaleBand()
        .domain(stackedData[0].map(d => d.data.product))
        .range([0, chartWidth])
        .padding(0.1);

    // Create a linear scale for the vertical axis.
    // let yLinearScale = newScale(productCounts, "markets", "y", "linear")
    let yLinearScale = d3.scaleLinear()
        .domain([0, 16000])
        .range([chartHeight, 0]);
    let bottomAxis = d3.axisBottom(xBandScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
        
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);




    // for a stacked bar chart, need to first add groups first and then rects for each segment
    let superGroup = chartGroup.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key ); // Add a class to each subgroup: their name
         
    let rectGroup = superGroup.selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xBandScale(d.data.product)) // data was sorted when entered into xBandScale
        .attr("y", d => yLinearScale(d[1]))
        .attr("height", d => yLinearScale(d[0]) - yLinearScale(d[1]))
        .attr("width", xBandScale.bandwidth());



    let legend = chartGroup.selectAll(".legend")
        .data(d3.schemePaired.slice(0,5))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
    
    legend.append("rect")
        .attr("x", chartWidth - 100)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {return d3.schemePaired.slice(0,5).slice().reverse()[i];});
    
    legend.append("text")
        .attr("x", chartWidth - 75)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) { 
            switch (i) {
                case 0: return "SNAP";
                case 1: return "SFMNP";
                case 2: return "WICCash";
                case 3: return "WIC";
                case 4: return "Credit";
            }
        });


    // standard bar chart: number of markets each product is sold in

    // let rectGroup = chartGroup.selectAll("unused")
    //     .data(productCounts)
    //     .enter()
    //     .append("g");

    // rectGroup.append("rect")
    //     .attr("width", xBandScale.bandwidth())
    //     .attr("height", d => chartHeight - yLinearScale(d["markets"]))
    //     .attr("x", d => xBandScale(d["product"]))
    //     .attr("y", d => yLinearScale(d["markets"]))
    //     .attr("class", "bar");


    // rectGroup.append("text")
    //     .attr("dx", d => xBandScale(d["product"]))
    //     .attr("dy", chartHeight + 12)
    //     .attr("font-size", "12px")
    //     .text(d => d["product"])
    //     .style("text-anchor", "start")
    //     .attr("transform", 
    //         d => `translate(${xBandScale(d["product"])},${chartHeight}) rotate(-65)`);
});
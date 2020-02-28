// ========== MAP ==========
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

// ========== HOVER FUNCTIONS ==========
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


// function to add listeners to layers
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

// ========== INFO CONTROL ==========
var info = L.control({position: 'bottomleft'});

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

// ========== LEGEND ==========
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


// ========== geojson promise ==========
d3.json("geojson").then(function(data) {
    // console.log(data.features);
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature}).addTo(myMap);
    
    geojson.eachLayer(function (layer) {
        layer._path.id = layer.feature.properties.name;
        });

    // event listener for drop down selection
    const select = document.querySelector('.form-control');
    select.addEventListener('change', stateZoom);

    // state dropdown handler function
    function stateZoom(e) {
        citylist(e);
        state=e.target.value;
        var table = d3.select("#market-table");
        var tbody = table.select("tbody");
        console.log(select);
        tbody.html("");
        geojson.eachLayer(function (layer) {
            if (layer.feature.properties.name == state) {
                myMap.fitBounds(layer.getBounds());
                var markets_dicts = layer.feature.properties.market_list;
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

    function citylist(e) {
        state=e.target.value;
        var table = d3.select("#city-table");
        var tbody = table.select("tbody");
        console.log(select);
        tbody.html("");
        geojson.eachLayer(function (layer) {
            if (layer.feature.properties.name == state) {
                myMap.fitBounds(layer.getBounds());
                var markets_dicts = layer.feature.properties.market_list;
                var city_list = [];
                markets_dicts.forEach(function(dict) {
                    var mar_city=dict.city;
                    if (!city_list.includes(mar_city)) {
                        city_list.push(mar_city);
                    }
                });
            city_list.forEach(function(city){
                var row = tbody.append("tr");
                var cell = row.append("td").text(city);
                });
            }
        });
    }

    // **** use of JS library we have not covered in class ****
    // **** the below code utilizes the jquery js library *****
    // handles click on table row and populates market info table
    $(document).ready(function(){
        $(document).on('click', 'td', function(){
            var name = $(this).text();
            var table = d3.select("#market-info");
            var tbody = table.select("tbody");
            tbody.html("");
            // var row = tbody.append("tr");
            states=data.features;
            states.forEach(function(x) {
                markets = x.properties.market_list;
                markets.forEach(function(y) {
                    Object.entries(y).forEach(([key,value]) => {
                        var dict;
                        if (value==name) {
                            dict = y;
                            // console.log(dict);
                            mar_name = y.marketname;
                            mar_city = y.city;
                            mar_street = y.street;
                            mar_season = y.season1date;
                            mar_time = y.season1time;
                            var row = tbody.append("tr");
                            row.append("td").html('<p> <b>Market:</b> ' +mar_name+ '<br> <b>City:</b> ' +mar_city+'<br> <b>Street:</b> '+mar_street+'<br> <b>Season:</b> ' +mar_season+'<br> <b>Hours of Operation:</b> ' +mar_time+'</p>')
                        };
                    });

                });
            });

        });
    })


// close promise 
});



// ==================== CHARTS =================================================================
// ==================== Arrays of all products and payment types ====================
var paymentOptions = ["credit","wic","wiccash","sfmnp","snap"];
var products = ["bakedgoods","cheese","crafts","flowers","eggs","seafood","herbs","vegetables","honey",
"jams","maple","meat","nursery","nuts","plants","poultry","prepared","soap","trees","wine","coffee","beans",
"fruits","grains","juices","mushrooms","petfood","tofu","wildharvested"];

// colors for stacked bar chart
var color = d3.scaleOrdinal()
    .domain(paymentOptions)
    .range(d3.schemePaired);


// svg container
var svgHeight = 400;
var svgWidth = 800;

// margins
var margin = {
  top: 80,
  right: 70,
  bottom: 50,
  left: 70
};

// chart area minus margins
var chartHeight = svgHeight - margin.top - margin.bottom - 40; // extra 40 for labels
var chartWidth = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3.select(".graph").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#86A386");


// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// returns an array of objects. Each object contains the product, the number of markets that product is sold in
// (filtered by state if included), the number of markets accepting each payment type for that product,
// and the sum of payment type acceptances
function countProducts(data, state) {
    let productCounts = []
    products.forEach(p => {
        let product = {};
        product["product"] = p;
        let productData = data.filter(d => !!state ? d[p] === "Y" && d["state"] === state : d[p] === "Y" );
        product["markets"] = productData.length;
        product["allPayments"] = 0;
        paymentOptions.forEach(payment => {
            let paymentProduct = productData.filter(d => d[payment] === "Y").length;
            product[payment] = paymentProduct;
            product["allPayments"] += paymentProduct;
        });
        productCounts.push(product);
    });
    productCounts.sort((a,b) => b["markets"] - a["markets"]);
    return productCounts;
}

function updateStandard(data, selection) {
    if (!!selection) {
        var state = d3.select(selection).property("value");
        // console.log(state);
        var productsCounts = countProducts(data, state);
    }
    else {
        var productsCounts = countProducts(data);
    }

    chartWidth = svgWidth - margin.left - margin.right

    chartGroup.selectAll("*").remove(); //clear before redrawing
    svg.selectAll("text").remove();
    svg.selectAll(".legend").remove();

    var xBandScale = d3.scaleBand()
        .domain(productsCounts.map(d => d["product"]))
        .range([0, chartWidth])
        .padding(0.1);
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(productsCounts.map(d => d["markets"])) * 1.1])
        .range([chartHeight, 0]);
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
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

    let rectGroup = chartGroup.selectAll("unused")
        .data(productsCounts)
        .enter()
        .append("g");

    rectGroup.append("rect")
        .attr("width", xBandScale.bandwidth())
        .attr("height", d => chartHeight - yLinearScale(d["markets"]))
        .attr("x", d => xBandScale(d["product"]))
        .attr("y", d => yLinearScale(d["markets"]))
        .attr("class", "bar")
        .attr("fill", "#006d2c");
    
    svg.append("text")
        .attr("x", svgWidth / 2)             
        .attr("y", 20)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("fill", "white")  
        .text(`Number of Markets Where Each Product Is Sold${!!selection ? " In " + state : ""}`);

    svg.append("text")
        .attr("x", -svgHeight / 2)             
        .attr("y", 20)
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("fill", "white") 
        .attr("transform", "rotate(-90)") 
        .text(`Markets Sold In`);
}

function updateStacked(data, selection) {
    if (!!selection) {
        var state = d3.select(selection).property("value");
        var productsCounts = countProducts(data, state);
    }
    else {
        var productsCounts = countProducts(data);
    }

    chartWidth = svgWidth - margin.left - margin.right - 60

    // organize data for stacked bar charts
    var stackedData = d3.stack()
        .keys(paymentOptions)(productsCounts)
    stackedData.forEach(d => d.sort((a,b) => b.data.markets - a.data.markets));

    // clear
    chartGroup.selectAll("*").remove();
    svg.selectAll("text").remove();
    svg.selectAll(".legend").remove();

    var xBandScale = d3.scaleBand()
        .domain(stackedData[0].map(d => d.data.product))
        .range([0, chartWidth])
        .padding(0.1);
    var yLinearScale = d3.scaleLinear()
        .domain([0, 1.1 * d3.max(productsCounts.map(p => p.allPayments/p.markets))])
        .range([chartHeight, 0]);
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
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
    var superGroup = chartGroup.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key ); // Add a class to each subgroup: their name
            
    var rectGroup = superGroup.selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .enter()

    rectGroup.append("rect")
        .attr("x", d => xBandScale(d.data.product)) // data was sorted when entered into xBandScale
        .attr("y", d => yLinearScale(d[1]/d.data.markets)) // percentage of total markets accepting each payment type
        .attr("height", d => yLinearScale(d[0]/d.data.markets) - yLinearScale(d[1]/d.data.markets))
        .attr("width", xBandScale.bandwidth());
    
    svg.append("text")
        .attr("x", svgWidth / 2)             
        .attr("y", 20)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")
        .style("fill", "white")  
        .text(`Percentage of Markets Accepting Payment Types By Product${!!selection ? " In " + state : ""}`);
    
    svg.append("text")
        .attr("x", -svgHeight / 2)             
        .attr("y", 20)
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("fill", "white") 
        .attr("transform", "rotate(-90)") 
        .text(`Percentage of Markets Accepting Payment Type`);

    var legend = svg.selectAll(".legend")
        .data(d3.schemePaired.slice(0,5))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return `translate(30, ${10 + i * 19})`; });
    
    legend.append("rect")
        .attr("x", svgWidth * 0.84)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {return d3.schemePaired.slice(0,5).slice().reverse()[i];});
    
    legend.append("text")
        .attr("x", svgWidth * 0.84 + 20)
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
}


d3.json("json").then(function(data) {
    // Initial standard bar chart: number of markets each product is sold in
    let chartType = "standard";
    let stateSelection = undefined; //initially undefined, will be updated on state selection

    updateStandard(data, stateSelection);

    // draw standard bar chart
    d3.select("#standard").on("click", function() {
        chartType = "standard";
        updateStandard(data, stateSelection);
    });

    // draw stacked bar chart
    d3.select("#stacked").on("click", function() {
        chartType = "stacked";
        updateStacked(data, stateSelection);
    });

    // redraw for a specific state
    d3.select(".form-control").on("change", function() {
        if (d3.select(this).property("value") === "Select State") {
            stateSelection = undefined;
        }
        else {
            stateSelection = this;
        }

        if (chartType === "standard") {
            updateStandard(data, stateSelection);
        }
        else if (chartType === "stacked") {
            updateStacked(data, stateSelection);
        }
    });
});
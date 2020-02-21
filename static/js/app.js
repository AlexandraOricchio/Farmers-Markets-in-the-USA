var paymentOptions = ["credit","wic","wiccash","sfmnp","snap"];
var products = ["bakedgoods","cheese","crafts","flowers","eggs","seafood","herbs","vegetables","honey",
"jams","maple","meat","nursery","nuts","plants","poultry","prepared","soap","trees","wine","coffee","beans",
"fruits","grains","juices","mushrooms","petfood","tofu","wildharvested"];

// svg container
var svgHeight = 600;
var svgWidth = 1000;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

// chart area minus margins
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3.select("body").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// function newLinearScale(data, chosenAxis, xy) 
// {
//     // create scales
//     if (xy === "x")
//     {
//         let xLinearScale = d3.scaleLinear()
//             .domain([d3.min(data, d => d[chosenAxis])*0.9, d3.max(data, d => d[chosenAxis])*1.1])
//             .range([0, chartWidth]);
//         return xLinearScale;
//     }
//     else
//     {
//         let yLinearScale = d3.scaleLinear()
//             .domain([d3.min(data, d => d[chosenAxis])*0.9, d3.max(data, d => d[chosenAxis])*1.1])
//             .range([chartHeight, 0]);
//         return yLinearScale;
//     }
// }

// // If xy is not "x", assume y axis change
// function renderAxes(newScale, axis, xy) 
// {
//     if (xy === "x")
//     {
//         let bottomAxis = d3.axisBottom(newScale)

//         axis.transition()
//             .duration(1000)
//             .call(bottomAxis);
//         return axis;
//     }
//     else
//     {
//         let leftAxis = d3.axisLeft(newScale);

//         axis.transition()
//             .duration(1000)
//             .call(leftAxis);
//         return axis;
//     }
// }

d3.json("json").then(function(data) {
    // create functions to pull data needed 

    let productCounts = [];
    products.forEach(p => {
        let product = {};
        product["product"] = p;
        product["count"] = data.filter(d => d[p] === "Y").length;
        productCounts.push(product);
    });
    productCounts.sort((a,b) => b["count"] - a["count"]);
    console.log(productCounts);

    

      // Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
    let xBandScale = d3.scaleBand()
        .domain(productCounts.map(d => d["product"]))
        .range([0, chartWidth])
        .padding(0.1);

    // Create a linear scale for the vertical axis.
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(productCounts, d => d["count"])])
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

    let rectGroup = chartGroup.selectAll("unused")
        .data(productCounts)
        .enter()
        .append("g");

    rectGroup.append("rect")
        .attr("width", xBandScale.bandwidth())
        .attr("height", d => chartHeight - yLinearScale(d["count"]))
        .attr("x", d => xBandScale(d["product"]))
        .attr("y", d => yLinearScale(d["count"]))
        .attr("class", "bar");

    // rectGroup.append("text")
    //     .attr("dx", d => xBandScale(d["product"]))
    //     .attr("dy", chartHeight + 12)
    //     .attr("font-size", "12px")
    //     .text(d => d["product"])
    //     .style("text-anchor", "start")
    //     .attr("transform", 
    //         d => `translate(${xBandScale(d["product"])},${chartHeight}) rotate(-65)`);
});




// create map object
// var myMap = L.map('map', {
//     center: [37.09, -95.71],
//     zoom: 5
// });

// // add tile layer to the map
// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: "mapbox.streets",
//     accessToken: API_KEY
// }).addTo(myMap);
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
var svg = d3.select("body").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

function newScale(data, chosenAxis, xy, scaleType) 
{
    let theRange = xy === "x" ? [0, chartWidth] : [chartHeight, 0];
    // create scales
    if (scaleType === "linear")
    {
        let theScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[chosenAxis])*1.1])
            .range(theRange);
        return theScale;
    }
    else if (scaleType === "band")
    {
        let theScale = d3.scaleBand()
            .domain(data.map(d => d[chosenAxis]))
            .range(theRange)
            .padding(0.1);
        return theScale;
    }
}

d3.json("json").then(function(data) {
    // create functions to pull data needed 

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

    // console.log(productCounts);

    var color = d3.scaleOrdinal()
        .domain(paymentOptions)
        .range(d3.schemeSet2);

    let stackedData = d3.stack()
        .keys(paymentOptions)(productCounts)

    stackedData.forEach(d => d.sort((a,b) => b.data.markets - a.data.markets));
    console.log(stackedData);

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

    let yLabelsGroup = chartGroup.append("g")
    // .attr("transform", `translate(300, 1000)`)
    .attr("transform", "rotate(-90)");  

    let yLabels = ["markets", "paymentOptions"]

    let marketsLabel = yLabelsGroup.append("text")
        .attr("x", -chartHeight/2)
        .attr("y", -30)
        .attr("value", "markets") // value to grab for event listener
        .classed("active", true)
        .text("Markets Sold In");
    let paymentsLabel = yLabelsGroup.append("text")
        .attr("x", -chartHeight/2)
        .attr("y", -50)
        .attr("value", "payments") // value to grab for event listener
        .classed("active", false)
        .text("Payment Types Accepted");

    yLabelsGroup.selectAll("text").on("click", function() 
    {
        // get value of selection
        var value = d3.select(this).attr("value");
        // console.log(value)
        if (value !== chosenYAxis) 
        {
            // replaces chosenYAxis with value
            chosenYAxis = value;

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = newScale(data, chosenYAxis, "y", );

            // updates y axis with transition
            yAxis = renderAxes(yLinearScale, yAxis, "y");

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, "y");


            // updates tooltips with new info
            // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            yLabels.forEach(label =>
            {
                if (label != chosenYAxis)
                {
                    // CSS selector
                    yLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else
                {
                    yLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", true)
                        .classed("inactive", false);
                }
            });
        }
    });
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
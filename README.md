# Project-2: Farmers Markets in the United States 

**Team:** Raul Haro, Alexandra Oricchio, Eli Payne

**Project Description:** 
For our project, we used United States farmers markets data from data.gov to create an interactive web dashboard. The dataset includes metrics for market name and location, payment types accepted, and available products. Our dashboard includes an interactive map and bar chart, presenting our data in different visualizations. 

Our first visual is a choropleth map of the United States which displays the farmers markets per 100,000 per state based on a color scale. The darker the state, the more markets per 100,000. If you hover over a specific state on the map, the information box in the bottom left corner of the map will display the number of total markets in the state and the number of markets per 100,000 in the state. 

To the left of our map is a drop-down selector for state. When a state is selected, our map zooms into that state and displays markers for each farmers market location within the state. Additionally, a list of the state’s markets by name populates in the left sidebar. When a market name within the state markets list is clicked, the market information box located in the left sidebar populates with the markets name, city, street, season and hours of operation. 

Our second visual is a bar chart which displays the number of markets each product is available at. This bar chart responds to the state dropdown selection as well. When a state is selected, the bar chart populates with data specific to the chosen state. 

[Data Source](https://catalog.data.gov/dataset/farmers-markets-geographic-data)

---

**Breakdown of work distribution:**
Together, we collectively cleaned our data set and imported it into PostgreSQL to create a database. We also worked together to build out our initial flask application which creates an API for our farmers market data. From there, we distributed the work as follows:

**Allie:** 
- Brought in a geoJSON API and added properties from our farmers market API to the geoJSON. 
- Created interactive choropleth map with hover feature.
- Created event listener and handler for the selection of state from dropdown. For the map, the event handler zooms in on the selected state and displays markers for each market in the state. For the side bar, the handler populates the cities and state markets scrollable list. 
- Created a second event listener and handler using jquery to populate the market(s) information panel based on the city or market name chosen from the scrollable lists. 

**Eli:** 
- Created D3 bar chart and stacked bar chart.
- Created event listener and handler to toggle between each bar chart. 
- Created event listener and handler for the selection of state from dropdown. The event handler changes the bar charts to display state specific data based on the state selected. 

**Raul:** 
- Created and designed layout of webpage. 
- Built out the html using bootstrap and CSS styling. This includes the creation of our webpage’s side bar and drop-down selector for state. This also includes the creation of our CSS style sheet, which creates our webpage’s overall theme and color scheme. 



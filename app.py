# import dependencies
import numpy as np
import os
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

import json 

with open('static/data/states.geojson') as f:
  geojson = json.load(f)

#################################################
# Database Setup
#################################################

# create engine 
dbuser = 'postgres'
dbpassword = 'postgres'
dbhost = 'localhost'
dbport = '5432'
dbname= 'farmers_markets'
engine = create_engine(f"postgres://{dbuser}:{dbpassword}@{dbhost}:{dbport}/{dbname}")

# declare base using automap
Base = automap_base()
# use the base class to reflect the database tables
Base.prepare(engine, reflect=True)
print(Base.classes.keys())
# assing the markets data class to a variable
Markets = Base.classes.market_data
columns = Markets.__table__.columns.keys()
#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# create flask route
@app.route("/json")
def markets_json():
    session = Session(engine)
    results = session.query(Markets).all()
    session.close()

    new_results = list(np.ravel(results))
    all_markets = []
    for market in results:
        d=market.__dict__
        del d['_sa_instance_state']
        all_markets.append(d)

    return jsonify(all_markets)

@app.route("/geojson")
def state_geojson():
    session = Session(engine)
    results = session.query(Markets).all()
    session.close()

    new_results = list(np.ravel(results))
    all_markets = []
    for market in results:
        d=market.__dict__
        del d['_sa_instance_state']
        all_markets.append(d)

    df=pd.DataFrame(all_markets)
    stateDF = pd.DataFrame(df["state"].value_counts())
    stateDF = stateDF.reset_index(drop=False)
    stateDF = stateDF.rename(columns={"index":"State", "state":"Markets"})
    for i in geojson["features"]:
        state=i["properties"]["name"]
        marketCount=stateDF[stateDF['State']==state]['Markets']
        i['properties']['markets']=int(marketCount.values[0])
    
    popDF= pd.read_csv("C:\\Users\\aeori\\git\\Project-2\\static\\data\\census_data.csv")
    popDF = popDF.rename(columns={"B01003_001E":"population", "NAME":"states", "state":"idNo."})
    popDF=popDF.drop(['Unnamed: 0','idNo.'], axis=1)
    for i in geojson["features"]:
        state=i["properties"]["name"]
        population=popDF[popDF['states']==state]['population']
        i['properties']['population']=population.values[0]
    
    for i in geojson["features"]:
        population10k=(i['properties']['population'])/10000
        i['properties']['population10k']=population10k
    
    for i in geojson['features']:
        marketsPerCap= (i['properties']['markets']/i['properties']['population'])*100000
        i['properties']['marketsPerCap']=marketsPerCap

    centersDF = pd.read_csv("C:\\Users\\aeori\\git\\Project-2\\static\\data\\state_centers.csv")
    for i in geojson['features']:
        state = i['properties']['name']
        if state in centersDF['State'].tolist():
            lat_center=centersDF[centersDF['State']==state]['Latitude']
            lon_center=centersDF[centersDF['State']==state]['Longitude']
        i['properties']['lat_center'] = lat_center.values[0]
        i['properties']['lon_center'] = lon_center.values[0]

    for i in geojson["features"]:
        market_list=[]
        state=i["properties"]["name"]
        for market in all_markets:
            if market["state"]==state:
                market_list.append(market)
            i["properties"]["market_list"]=market_list
    
    return jsonify(geojson)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)
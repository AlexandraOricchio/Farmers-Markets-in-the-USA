# import dependencies
import numpy as np
import os

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

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)
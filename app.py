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

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# create flask route
@app.route("/")
def markets():
    session = Session(engine)
    results = session.query(Markets.fmid).all()
    session.close()
    all_names = list(np.ravel(results))

    return jsonify(all_names)

if __name__ == '__main__':
    app.run(debug=True)
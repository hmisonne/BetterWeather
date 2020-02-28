import os

from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import requests
import csv
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)



# Configure session to use filesystem
# app.config["SESSION_PERMANENT"] = False
# app.config["SESSION_TYPE"] = "filesystem"
# Session(app)

# Set up database
# engine = create_engine("sqlite:///data.db")
# db = scoped_session(sessionmaker(bind=engine))



class Geolocalisation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"Geolocalisation: {self.city}, {self.country}, lat: {self.lat}, lng: {self.lng}"

class Timezone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) 
    offset = db.Column(db.Integer)

    def __repr__(self):
        return f"Timezone: {self.name}, {self.offset}"


# WORDS = Geolocalisation.query.with_entities(Geolocalisation.city).filter(Geolocalisation.city.like(f'par%')).all() format not satisfactory

# Initialize list with all major cities for city route
WORDS = []

with open('worldcities.csv') as f:
    reader = csv.reader(f)
    for city, lat, lng, country in reader:
        WORDS.append(f"{city}, {country}")


@app.route("/")
def index():
    
    return render_template("index.html")





@app.route("/search", methods=["POST"])
def search():
    # Query for city weather

    # Get data typed in input field
    city = request.form.get("city")

    # If data selected from select menu get the value
    city_selected = request.form.get("city_selected")
    if city_selected != "":
        city = city_selected

    # Separate city from country if comma in entry
    if "," in city:
        city_name = city.split(",")[0]
        city_country = city.split(",")[1]
        city_country = city_country.lstrip()
    else:
        city_name = city
        city_country =""
    
    print(city)
    # Add upper case to words to match with database
    city_name = city_name.title()
    city_country = city_country.title()

    # Query database with input info
    city = Geolocalisation.query.filter_by(city=city_name, country=city_country).first()

    # if city, country not exactly specified look for similar entries
    if city == None:
        city = Geolocalisation.query.filter(Geolocalisation.city.like(f'{city_name}%'),Geolocalisation.country.like(f'{city_country}%')).first()
        
        # city_name = Geolocalisation.query.with_entities(Geolocalisation.city).filter(Geolocalisation.city.like(f'{city_name}%')).first()
        
        # if nothing found, return error message
        if city == None:
            print("error")
            return jsonify({"success": False})

    city_name = city.city 
    latitude = city.lat
    longitude = city.lng
    country = city.country

    # Initiate API call, (add proxy since locally hosted)
    proxy = 'https://cors-anywhere.herokuapp.com/';
    res = requests.get(f"https://api.darksky.net/forecast/86bf1fb9bd6689a91560c970d7ad7bfc/{latitude},{longitude}")

    # Make sure request succeeded
    if res.status_code != 200:
        return jsonify({"success": False})

    # Retrieve current data from API
    data = res.json()['currently']
    tz = res.json()['timezone']

    utcoffset = Timezone.query.filter_by(name=tz).first()

    offset = utcoffset.offset
    data2 = res.json()['hourly']

    # Gather information to send back to JS        
    temp_per_hour = []
    hour_list = []
    precip_per_hour = []
    wind_per_hour = []

    for i in range(24):
        if i == 0 or i % 3 == 0:
            temp =data2['data'][i]['temperature']
            precip = data2['data'][i]['precipProbability']
            customTimestamp = data2['data'][i]['time']
            windspeed = data2['data'][i]['windSpeed']
            time = datetime.utcfromtimestamp(customTimestamp+3600*offset)
            hour = time.strftime('%H:00')
            
            wind_per_hour.append(windspeed)
            precip_per_hour.append(int(precip*100))
            hour_list.append(hour)
            temp_per_hour.append(temp)


    return jsonify({"success": True, "summary": data["summary"], "temperature": data["temperature"], 
        "icon": data["icon"], "city": city_name, "country": country, "time": data["time"], 
        "temp_per_hour" : temp_per_hour, "hour_list": hour_list, "wind_per_hour": wind_per_hour, "precip_per_hour": precip_per_hour })



@app.route("/city")
def search_city():
    # Display result of city names that start with user input

    q = request.args.get("q")
    q = q.title()
    words = [word for word in WORDS if q and word.startswith(q)]

    # Display only 10 first matches
    return jsonify(words[:10])


# if __name__ == '__main__':
#   flask.run(app)
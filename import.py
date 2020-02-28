import csv

from application import db, Geolocalisation, Timezone


def main():
	f = open('worldcities.csv')
	reader = csv.reader(f)
	for city, lat, lng, country in reader:
		coordinate = Geolocalisation(city=city, lat=lat, lng=lng, country=country)
		db.session.add(coordinate)
	db.session.commit()

if __name__ == "__main__":
    main()


f = open('worldcities.csv')
reader = csv.reader(f)
for city, lat, lng, country in reader:
	coordinate = Geolocalisation(city=city, lat=lat, lng=lng, country=country)
	db.session.add(coordinate)
db.session.commit()

f = open('timezones.csv')
reader = csv.reader(f)
for TZname, UTCoffset in reader:
	tz = Timezone(name=TZname, offset=UTCoffset)
	db.session.add(tz)
db.session.commit()


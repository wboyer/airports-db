db.airports.remove();
db.airports.ensureIndex( { "code": 1 });

load('airports.json');

for (i in airports.airports)
	db.airports.save(airports.airports[i]);


db.airports_index.remove();

load('index-airports-collection.js');

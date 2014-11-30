// Load the SITA airport dataset into the "airports" collection, and then index it.

db.airports.remove();
db.airports_index.remove();

db.airports.ensureIndex({ "code": 1 });

load('airports.json');

for (i in airports.airports) {
    var airport = airports.airports[i];
    if (airport.lat && airport.lng)
        db.airports.save(airport);
}

load('index-airports-collection.js');

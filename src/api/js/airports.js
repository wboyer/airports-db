var mongodb = require('mongodb');

var Server = mongodb.Server;
var Db = mongodb.Db;
var BSON = mongodb.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('test', server);
 
db.open(function(err, db)
{
	if (!err) {
		db.collection('airports', {strict:true}, function(err, collection) {
		if (err) {
			console.error(err);
			console.error("The 'airports' collection doesn't exist.");
		}
		});
	}
});

function addCorsHeaders (res)
{
	res.header('Access-Control-Allow-Origin', '*');
}

exports.findByCode = function(req, res)
{
	addCorsHeaders(res);

	var code = req.params.code;

	db.collection('airports', function(err, collection) {
		collection.findOne({'code':code}, function(err, doc) {
			if (err) {
				console.error(err);
				res.statusCode = 503;
				res.send({'error': 'An error has occurred'});
			}
			else if (!doc)
				res.statusCode = 404;
			else
				res.send(doc);
		});
	});
};
 
exports.findAll = function(req, res)
{
	addCorsHeaders(res);

	db.collection('airports', function(err, collection) {
		collection.find().toArray(function(err, docs) {
			if (err) {
				console.error(err);
				res.statusCode = 503;
				res.send({'error': 'An error has occurred'});
			}
			else
				res.send(docs);
		});
	});
};
 
exports.searchByPrefix = function(res, func)
{
	addCorsHeaders(res);

	var prefix = req.params.prefix;

	db.collection('airports_index', function(err, collection) {
		var query = JSON.parse('{"_id": { "prefix": "' + prefix + '"}}');
		collection.findOne(query, function(err, doc) {
			if (err) {
				console.error(err);
				res.statusCode = 503;
				res.send({'error': 'An error has occurred'});
			}
			else
				func(doc ? doc.value.matches : []);
		});
	});
}

exports.addRoutes = function(app)
{
	app.get('/airports', exports.findAll);
	app.get('/airports/:id', exports.findByCode);
	app.get('/airports/search', exports.searchByPrefix);
};

exports.bindTo = function(app) {

	app.get('/', function(req, res) {
		res.send('Authenticated !');
	});

}
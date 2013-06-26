module.exports = exports = function(app, api) {

	app.get('/users/:userId', function(req, res) {
		
	});

	app.get('/users', function(req, res) {
		res.send(200, 'Hello World !');
	});

};
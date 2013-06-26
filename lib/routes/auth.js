module.exports = exports = function(app, api) {

	app.get('/auth/logout', function(req, res) {
		res.send(401);
	});

	app.get('/auth/ping', function(req, res) {
		res.send(200, {result: 'PONG'});
	});

};
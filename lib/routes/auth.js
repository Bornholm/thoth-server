module.exports = exports = function(app, api) {

	app.get('/auth/logout', function(req, res) {
		res.status(401);
		res.set('WWW-Authenticate', 'Basic realm="Thoth"');
		res.end();
	});

	app.get('/auth/ping', function(req, res) {
		res.send(200);
	});

};
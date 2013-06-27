module.exports = exports = function(app, api) {

	app.get('/records', function(req, res) {
		


	});

	app.post('/records', function(req, res) {
		
		var user = req.remoteUser;
		var User = api.models.User;

		user.isAllowed(['create'])

	});



};
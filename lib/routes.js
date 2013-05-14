var models = require('./models');

exports.bindTo = function(app) {

	app.post('/login', function(req, res) {

		var email = req.body.email;
		var password = req.body.password;

	});

	app.post('/register', function(req, res) {

		var email = req.body.email;
		var password = req.body.password;
		var name = req.body.name;

		models.User.create({
			email: email,
			password: password,
			name: name
		}).success(function(user) {
			if(user) return res.send(200);
			res.send(500);
		});

	});

}
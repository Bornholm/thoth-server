var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var Record = require('../models/record');

module.exports = exports = function(app, api) {

	app.get('/records', function(req, res) {
		


	});

	app.post('/records', function(req, res, next) {
		var user = req.user;
		var data = req.body;
		if(data) {
			var isAllowed = user.hasPermission('create', data);
			if(isAllowed) {
				var rec = new Record(data);
				rec.creator = user._id;
				rec.save(function(err, record) {
					if(err) return next(err);
					res.send(record.decrypt());
				});
			} else return next(new UnauthorizedError());
		} else return next(new InvalidRequestError());
	});



};
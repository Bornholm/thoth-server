var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');
var check = require('validator').check;
var Record = require('../models/record');
var ops = require('../util/ops');

module.exports = exports = function(app, api) {

	app.get('/records', function(req, res, next) {
		var user = req.user;
		var skip = req.param('skip') || 0;
		var limit = req.param('limit') || 0;
		var search = req.param('search');

		try {
			skip && check(+skip, 'skip parameter must be a positive integer.').isNumeric().min(0);
			limit && check(+limit, 'limit parameter must be a positive integer.').isNumeric().min(0);
			search && check(search, 'search parameter must be an alphanumeric text.').is(/[^\*\(\)\{\}]/i);
		} catch(err) {
			return next(err);
		}

		var isAllowed = user.hasPermission(ops.READ, {type: 'Record'});
		if(isAllowed) {
			var q = Record.find()
			skip && q.skip(skip);
			limit && q.limit(limit);
			if(search) {
				var or = [];
				var tokens = search.split(' ');
				if(tokens.length) {	
					or.push({
						label: new RegExp(tokens.join('|'), 'i')
					});
					or.push({
						tags: {'$in': tokens}	
					});
				}
				q.or(or);
			}
			q.exec(function(err, records) {
				if(err) return next(err);
				return res.send(records.filter(function(r) {
					return user.hasPermission(ops.READ, r)
				}));
			});
		} else return next(new UnauthorizedError());

	});

	app.post('/records', function(req, res, next) {
		var user = req.user;
		var data = req.body;
		if(data) {
			var isAllowed = user.hasPermission(ops.CREATE, data);
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

	app.put('/records/:recordId', function(req, res, next) {
		var recordId;
		var user = req.user;
		var newRecord = req.body;
		var recordId = req.params.recordId;
		if(newRecord && recordId) {
			Record.findById(recordId, function(err, record){
				if(err) return next(err);
				if(record) {
					var isAllowed = user.hasPermission(ops.UPDATE, record);
					if(isAllowed) {
						record.label = newRecord.label;
						record.text = newRecord.text;
						record.tags = newRecord.tags;
						record.save(function(err, record) {
							if(err) return next(err);
							res.send(200, record.decrypt());
						});
					} else return next(new UnauthorizedError());
				} else return next(new UnknownResourceError());
			})
		} else return next(new InvalidRequestError());
	});

	app.get('/records/:recordId', function(req, res, next) {
		var user = req.user;
		var recordId = req.params.recordId;
		Record.findOne({_id: recordId}, function(err, record){
			if(err) return next(err);
			if(record) {
				var isAllowed = user.hasPermission(ops.READ, record);
				if(isAllowed) {
					return res.send(record);
				} else return next(new UnauthorizedError());
			} else return next(new UnknownResourceError());
		});
	});



};
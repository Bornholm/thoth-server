var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');
var check = require('validator').check;
var Record = require('../models/record');
var ops = require('../util/ops');
var helpers = require('../util/helpers.js');

module.exports = exports = function(app, api) {

	// GET /api/records(?skip=<skip_results>)(&limit=<limit_results>)(&search=<search_filter) -> [Record...]
	app.get(
		'/records', 
		helpers.getModelQueryHandler(Record, {
			searchFields: ['label', 'tags'],
			accessFilter: {type: 'Record'}
		})
	);
	
	// POST /api/records -> Record
	app.post('/records', function(req, res, next) {
		var user = req.user;
		var data = req.body;
		if(data) {
			user.hasPermission(opts.CREATE, data, function(err, isAllowed) {
				if(err) {
					return next(err);
				}
				if(isAllowed) {
					var rec = new Record(data);
					rec.creator = user._id;
					rec.save(function(err, record) {
						if(err) return next(err);
						res.send(record.decrypt());
					});
				} else {
					return next(new UnauthorizedError());
				}
			});
		} else {
			return next(new InvalidRequestError());
		}
	});

	app.put('/records/:id', helpers.getModelUpdateHandler(Record, {
		update: function(record, update) {
			record.label = update.label;
			record.text = update.text;
			record.tags = update.tags;
		},
		transform: function(record) {
			return record.decrypt();
		}
	}));

	// GET /api/records/<recordId> -> Record
	app.get('/records/:recordId', function(req, res, next) {
		var user = req.user;
		var recordId = req.params.recordId;

		try {
			recordId && check(recordId, 'record id parameter must be an alphanumeric string.').isAlphanumeric();
		} catch(err) {
			return next(err);
		}

		Record.findOne({_id: recordId}, function(err, record){
			if(err) {
				return next(err);
			}
			if(record) {
				user.hasPermission(ops.READ, record, function(err, isAllowed) {
					if(err) {
						return next(err);
					}
					if(isAllowed) {
						return res.send(record);
					} else {
						return next(new UnauthorizedError());
					}
				});
			} else {
				return next(new UnknownResourceError());
			}
		});
	});



};
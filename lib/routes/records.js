var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');
var check = require('validator').check;
var Record = require('../models/record');
var rbac = require('mongoose-rbac');
var ops = require('../util/ops');
var helpers = require('../util/helpers.js');
var _ = require('lodash');
var async = require('async');

function getAccessControlHandler(action) {
	return function(user, record, done) {
		var categories = record.getIncludingCategories();
		var actsAndSubs = categories.map(function(cat) {
			cat = cat.join('.');
			return [[action, cat], ['*', cat], [action, '*']];
		});
		actsAndSubs = _.flatten(actsAndSubs, true);
		actsAndSubs.push(['*', '*']);
		return user.canAny(actsAndSubs, done);
	}
}

module.exports = exports = function(app, api) {

	// GET /api/records(?skip=<skip_results>)(&limit=<limit_results>)(&search=<search_filter) -> [Record...]
	app.get(
		'/records',
		helpers.getModelQueryHandler(Record, {
			searchFields: ['label', 'tags', 'category'],
			subjects: api.acl.getAvailableSubjects()
		})
	);

	app.get('/records/categories', function(req, res, next) {
		
		var user = req.user;
		var op = req.param('op');

		try {
      check(op, 'op parameter must me a valid action !').isIn(_.values(ops));
    } catch(err) {
      return next(err);
    }

		var subjects = api.acl.getAvailableSubjects();
		async.reduce(
			subjects,
			[],
			function(result, sub, next) {
				var joined = sub.join('.');
				var actsAndSubs = [
					['*', '*'],
					[op, '*'],
					['*', joined],
					[op, joined]
				];
				user.canAny(actsAndSubs, function(err, can) {
					if(err) {
						return next(err);
					}
					if(can) {
						result.push(sub);
					}
					return next(null, result);
				});
			},
			function(err, result) {
				if(err) {
					return next(err);
				}
				return res.send(result);
			}
		);

	});

	app.get(
		'/records/stats', 
		helpers.getModelQueryHandler(Record, {
			searchFields: ['label', 'tags', 'category'],
			subjects: api.acl.getAvailableSubjects(),
			transform: function(records, done) {
				return done(null, {total: records.length});
			}
		})
	);


	function completeRecord(record, data, done) {

		if('text' in data) {
			record.text = data.text;
		}

		if('label' in data) {
			record.label = data.label;
		}

		if(Array.isArray(data.tags)) {
			record.tags = data.tags;
		}

		if(Array.isArray(data.category)) {
			var subjects = api.acl.getAvailableSubjects();
			var isIn = _.any(subjects, function(sub) {
				return sub.toString() === data.category.toString();
			});
			if(isIn) {
				record.category = data.category;
			} else {
				return done(new Error('Invalid category !'));
			}
		}
		
		return done();

	}

	app.post(
		'/records',
		helpers.getModelCreateHandler(Record, {
			controlAccess: getAccessControlHandler(ops.CREATE),
			update: completeRecord,
			transform: function(record, done) {
				return done(null, record.decrypt());
			}
		})
	);

	app.put('/records/:id', helpers.getModelUpdateHandler(Record, {
		controlAccess: getAccessControlHandler(ops.UPDATE),
		update: completeRecord,
		transform: function(record, done) {
			return done(null, record.decrypt());
		}
	}));

	// GET /api/records/<recordId> -> Record
	app.get('/records/:id', helpers.getModelGetOneHandler(Record, {
		controlAccess: getAccessControlHandler(ops.READ),
	}));

	// DEL /api/records/<recordId> -> 204
	app.del('/records/:id', helpers.getModelDeleteHandler(Record, {
		controlAccess: getAccessControlHandler(ops.DELETE)
	}));

};

var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');
var check = require('validator').check;
var Record = require('../models/record');
var Tag = require('../models/tag');
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

	app.post(
		'/records',
		helpers.getModelCreateHandler(Record, {
			update: function(record, data, done) {

				if(data.text) {
					record.text = data.text;
				}

				if(data.label) {
					record.label = data.label;
				}

				if(data.tags) {
					var q = {
						label: {
							$in: data.tags
						}
					};
					Tag.count(q, function(err, count) {
						if(err) {
							return done(err);
						}
						if(count === 0 || count === data.tags.length) {
							record.tags = data.tags;
							return done();
						} else {
							return done(new InvalidRequestError());
						}
					});
				} else {
					return done();
				}

			},
			transform: function(record, done) {
				return done(null, record.decrypt());
			}
		})
	);

	app.put('/records/:id', helpers.getModelUpdateHandler(Record, {
		update: function(record, update, done) {

			if(!('revision' in update)) {
				return done(new InvalidRequestError('Invalid revision number !'));
			} else {
				record.revision = update.revision;
			}
			
			if('label' in update) {
				record.label = update.label;
			}
			
			if('text' in update) {
				record.text = update.text;
			}

			if(Array.isArray(update.tags)) {
				var query = {
					label: {
						$in: update.tags
					}
				};

				// On vérifie que les tags sont bien présents en base
				Tag.count(query, function(err, count) {
					if(err) {
						return done(err);
					}
					if(count === update.tags.length) {
						record.tags = update.tags;
						return done();
					} else {
						return done(new InvalidRequestError());
					}
				});
			} else {
				return done();
			}
		},
		transform: function(record, done) {
			return done(null, record.decrypt());
		}
	}));

	// GET /api/records/<recordId> -> Record
	app.get('/records/:id', helpers.getModelGetOneHandler(Record));

	// DEL /api/records/<recordId> -> 204
	app.del('/records/:id', helpers.getModelDeleteHandler(Record));

};
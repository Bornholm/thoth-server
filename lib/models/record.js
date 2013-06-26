var mongoose = require('mongoose');
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');
var encrypt = require('./plugins/encrypt');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
	label: String,
	tags: [Types.Mixed],
	data: String,
	creator: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});
schema.plugin(encrypt, {
	fields: ['data']
});

module.exports = exports = mongoose.model('Record', schema);
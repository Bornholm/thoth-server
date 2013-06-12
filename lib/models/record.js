var mongoose = require('mongoose');
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
	label: String,
	tags: [Types.Mixed],
	data: [Types.Mixed],
	creator: {
		type: Types.ObjectId,
		required: true
	}
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});

module.exports = exports = mongoose.model('Record', schema);
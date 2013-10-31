var mongoose = require('mongoose');
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var encrypt = require('./plugins/encrypt');
var without = require('./plugins/without');
var revision = require('./plugins/revision');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
	label: String,
	tags: [{type: String}],
	text: String,
	creator: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	},
  type: {
    type: String,
    default: 'Record'
  }
});

schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});
schema.plugin(without);
schema.plugin(revision);
schema.plugin(encrypt, {
	fields: ['text']
});


module.exports = exports = mongoose.model('Record', schema);
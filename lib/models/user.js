var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');

var schema = new Schema({
	name: String,
	auth: Types.Mixed
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});

module.exports = exports = mongoose.model('User', schema);
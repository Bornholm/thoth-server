var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');
var resourcesAccess = require('./plugins/resources-access');

var schema = new Schema({
	name: String,
	auth: Types.Mixed
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});
schema.plugin(resourcesAccess);

module.exports = exports = mongoose.model('User', schema);
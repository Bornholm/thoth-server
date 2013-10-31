var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var without = require('./plugins/without');
var resourcesAccess = require('./plugins/resources-access');

var schema = new Schema({
	name: String,
	email: {type: String, unique: true, lowercase: true},
	auth: {
		type: Types.Mixed,
		default: Object.create.bind(null, null) 
	},
  type: {
    type: String,
    default: 'User'
  }
});

schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});
schema.plugin(resourcesAccess);
schema.plugin(without);

var Role = resourcesAccess.Role;

module.exports = exports = mongoose.model('User', schema);
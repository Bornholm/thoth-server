var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');
var without = require('./plugins/without');
var resourcesAccess = require('./plugins/resources-access');

var schema = new Schema({
	name: String,
	email: {type: String, unique: true, lowercase: true},
	auth: {
		type: Types.Mixed,
		default: Object.create.bind(null, null) 
	}
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});
schema.plugin(resourcesAccess);
schema.plugin(without);

var Role = resourcesAccess.Role;
schema.virtual('type').get(function() { return 'User'; });

Role.schema.virtual('type').get(function() { return 'Role'; });

module.exports = exports = mongoose.model('User', schema);
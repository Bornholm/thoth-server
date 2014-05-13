var rbac = require('mongoose-rbac');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var without = require('./plugins/without');

var schema = new Schema({
	name: String,
	email: {type: String, unique: true, lowercase: true, required: true},
	auth: {
		type: Types.Mixed,
		default: Object.create.bind(null, null) 
	}
});

schema.plugin(rbac.plugin);
schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});
schema.plugin(without);

module.exports = exports = mongoose.model('User', schema);
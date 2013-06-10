var mongoose = require('mongoose');
var rbac = require('mongoose-rbac');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
	
	

});

schema.plugin(rbac.plugin);

module.exports = exports = mongoose.model('User', schema);
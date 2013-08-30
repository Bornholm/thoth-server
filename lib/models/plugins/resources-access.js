var sift = require('sift');
var _ = require('lodash');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;

var roleSchema = new mongoose.Schema({
	name: String,
	permissions: [{type: Types.Mixed}]
});

function addPermission(operation, query, cb) {
	var permissions = this.permissions = this.permissions || [];
	permissions.push({
		op: operation,
		q: query
	});
	this.markModified('permissions');
	this.save(cb);
};

roleSchema.methods.addPermission = addPermission;

var Role = mongoose.model('Role', roleSchema);

var plugin = function resourcesAccessPlugin(schema, options) {

	schema.add({
		roles: [{type: String, required: true, unique: true, lowercase: true}],
		permissions: [{type: Types.Mixed}]
	});

	function check(permissions, operation, resource) {
		return _.any(permissions, function(p) {
			return (p.op == '*' || p.op === operation) &&
				(p.q == '*' || sift(p.q, [resource]).length === 1);
		});
	}

	schema.methods.hasPermission = function(operation, resource, cb) {
		var hasPermission = check(this.permissions, operation, resource);
		if(hasPermission) {
			return process.nextTick(cb.bind(null, null, hasPermission));
		}
		Role.find({name: this.roles}, function(err, roles) {
			if(err) {
				return cb(err);
			}
			hasPermission = roles.some(function(role) {
				return check(role.permissions, operation, resource);
			});
			cb(null, hasPermission);
		});
		return this;
	};

	schema.methods.addRole = function(roleName, cb) {
		var roles = this.roles = this.roles || [];
		if(!this.hasRole(roleName)) {
			roles.push(roleName);
			this.markModified('roles');
		}
		this.save(cb);
	};

	schema.methods.hasRole = function(roleName) {
		return !!~this.roles.indexOf(roleName);
	};

	schema.methods.addPermission = addPermission;

};

plugin.Role = Role;

module.exports = exports = plugin;
var sift = require('sift');
var _ = require('lodash');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;

var plugin = function resourcesAccessPlugin(schema, options) {

	schema.add({
		permissions: [{type: Types.Mixed}]
	});

	schema.methods.hasPermission = function(operation, resource) {
		var permissions = this.permissions;
		return _.any(permissions, function(p) {
			return (p.op === '*' || p.op === operation) && (p.q === '*' || sift(p.q, [resource]).length === 1);
		});
	};

	schema.methods.addPermission = function(operation, query, cb) {
		var permissions = this.permissions = this.permissions || [];
		permissions.push({
			op: operation,
			q: query
		});
		this.markModified('permissions');
		this.save(cb);
	};

};

module.exports = exports = plugin;
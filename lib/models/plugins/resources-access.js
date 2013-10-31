var sift = require('sift');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var _ = require('lodash');

var roleSchema = new mongoose.Schema({
	name: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true
  },
  type: {
    default: 'Role',
    type: String
  },
	permissions: [{
    op: {
      type: String,
      lowercase: true,
      trim: true
    },
    q: {
      type: Types.Mixed
    }
  }]
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
		roles: {
      type: [{
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true
      }],
      default: getDefaultRoles
    },
		permissions: {
      type: [{
        type: Types.Mixed
      }],
      default: getDefaultPermissions
    }
	});

  var _defaultPermissions = [];
  schema.statics.setDefaultPermissions = function(perms) {
    _defaultPermissions = perms;
  };

  var _defaultRoles = [];
  schema.statics.setDefaultRoles = function(roles) {
    _defaultRoles = roles;
  };

  function getDefaultPermissions() {
    return _.clone(_defaultPermissions);
  }

  function getDefaultRoles() {
    return _.clone(_defaultRoles);
  }

	function check(permissions, operation, resource) {
		return _.any(permissions, function(p) {
			return (p.op == '*' || p.op === operation) &&
				(p.q == '*' || sift(p.q).test(resource));
		});
	}

  function createOrConditions(operation, permissions) {
    var conditions = permissions.reduce(function(arr, p) {
      if(p.op === operation || p.op === '*') {
        arr.push(p.q);
      }
      return arr;
    }, []);
    return conditions;
  }

  schema.methods.limitQueryWithPermissions = function(query, operation, cb) {
    var conditions = createOrConditions(operation, this.permissions);
    this.findRolesWithOperation(operation, function(err, roles) {
      if(err) {
        return cb(err);
      }
      roles.forEach(function(r) {
        conditions.push.apply(conditions, createOrConditions(operation, r.permissions));
      });
      if(conditions.length) {
        query.or(conditions);
      } else {
        query.nor();
      }
      return cb(null, query);
    });
    return this;
  };

  schema.methods.findRolesWithOperation = function(operation, cb) {
    var query = {
      name: {
        '$in': this.roles
      },
      permissions: {
        $elemMatch: {
          op: {
            '$in' : ['*', operation]
          }
        }
      }
    };
    Role.find(query, cb);
    return this;
  }

	schema.methods.hasPermission = function(operation, resource, cb) {
		var hasPermission = check(this.permissions, operation, resource);
		if(hasPermission) {
			return process.nextTick(cb.bind(null, null, hasPermission));
		}
    this.findRolesWithOperation(operation, function(err, roles) {
      if(err) {
        return cb(err);
      }
      hasPermission = roles.some(function(role) {
        return check(role.permissions, operation, resource);
      });
      return cb(null, hasPermission);
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

	schema.methods.filterAllowed = function(operation, resources, cb) {
		var actor = this;
		async.reduce(
      resources,
      [], 
      function(memo, res, cb) {
        actor.hasPermission(operation, res, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            memo.push(res);
          }
          return cb(null, memo);
        });
    }, cb);
	};

	schema.methods.addPermission = addPermission;

};

plugin.Role = Role;

module.exports = exports = plugin;
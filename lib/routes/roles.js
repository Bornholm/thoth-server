var Role = require('../models/plugins/resources-access').Role;
var ops = require('../util/ops');
var helpers = require('../util/helpers');
var check = require('validator').check;
var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');
var _ = require('lodash');


function checkRoleId(roleId) {
  roleId && check(roleId, 'role id parameter must be an alphanumeric string.').isAlphanumeric();
}

var ninRegexp = /^!/;
function tagsAsQuery(tags) {
  var q = {
    type: 'Record',
    tags: {}
  };
  (tags || []).forEach(function(t) {
    if(t !== '*') {
      if(ninRegexp.test(t)) {
        q.tags.$nin = q.tags.$nin || [];
        if(!~q.tags.$nin.indexOf(t)) {
          q.tags.$nin.push(t.slice(1));
        }
      } else {
        q.tags.$in = q.tags.$in || [];
        q.tags.$in.push(t);
      }
    }
  });
  return q;
};

function asTagsPermissions(role) {
  var role = role.toObject();
  role.permissions.forEach(function(p) {
    p.tags = queryAsTags(p.q);
    delete p.q;
  });
  return role;
}

function isValidTaggedPermission(p) {
  var i, len, p;
  for(i = 0, len = p.length; i < len; ++i) {
    p = p[i];
    if(!p.op || !Array.isArray(p.tags)) {
      return false;
    }
  }

}

module.exports = exports = function(app, api) {

  // GET /api/roles/<roleId> -> User
  app.get('/roles/:roleId', function(req, res, next) {

    var user = req.user;
    var roleId = req.params.roleId;

    try {
      checkRoleId();
    } catch(err) {
      return next(err);
    }
    
    Role.findById(roleId, function(err, role){
      if(err) {
        return next(err);
      }
      if(role) {
        user.hasPermission(ops.READ, role, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            return res.send(role);
          } else {
            return next(new UnauthorizedError());
          }
        });
      } else {
        return next(new UnknownResourceError());
      }
    });

  });

  // PUT /api/roles/<roleId>/permissions/records
  // Overwrite records access permissions associated with the given role
  app.put('/roles/:roleId/permissions/records', function(req, res, next) {

    var user = req.user;
    var roleId = req.params.roleId;
    var permissions = req.body || [];

    try {
      checkRoleId();
    } catch(err) {
      return next(err);
    }

    if(!Array.isArray(permissions)) {
      return next(new InvalidRequestError());
    } else {
      var i, len, p;
      for(i = 0, len = permissions.length; i < len; ++i) {
        p = permissions[i];
        if(!p.op || !Array.isArray(p.tags)) {
          return next(new InvalidRequestError());
        }
      }
    }

    Role.findById(roleId, function(err, role){
      if(err) {
        return next(err);
      }
      if(role) {
        user.hasPermission(ops.UPDATE, role, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {

            var newPermissions = _.reject(role.permissions, function(p) {
              return p.q.type === 'Record'
            });

            newPermissions.push.apply(newPermissions, permissions.map(function(p) {
              return {
                op: p.op,
                q: tagsAsQuery(p.tags)
              }
            }));

            role.permissions = newPermissions;
            role.markModified('permissions');

            return role.save(function(err) {
              if(err) {
                return next(err);
              }
              user.hasPermission(ops.READ, role, function(err, isAllowed) {
                if(err) {
                  return next(err);
                }
                if(isAllowed) {
                  return res.send(role);
                } else {
                  return res.send(200);
                }
              });
            });
          } else {
            return next(new UnauthorizedError());
          }
        });
      } else {
        return next(new UnknownResourceError());
      }
    });
  });
  
  // PUT /api/roles/:id
  // Update role name
  app.put('/roles/:id', helpers.getModelUpdateHandler(Role, {
    update: function(role, update) {
      if(update.name) {
        role.name = update.name;
      }
    }
  }));

  app.post('/roles', helpers.getModelCreateHandler(Role, {
    update: function(newRole, fields) {
      if(fields.name) {
        newRole.name = fields.name;
      } else {
        throw new InvalidRequestError();
      }
    }
  }));

  // GET /api/roles(?skip=<skip_results>)(&limit=<limit_results>)(&search=<search_filter) -> [Role...]
  app.get(
    '/roles', 
    helpers.getModelQueryHandler(Role, {
      searchFields: ['name'],
      accessFilter: {type: 'Role'}
    })
  );

};

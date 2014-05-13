var async = require('async');
var _ = require('lodash');

module.exports = exports = function(app, program) {

  var common = require('./common')(app, program);

  async.waterfall([
    common.askUserEmail,
    common.findUserByEmail,
    common.askRole,
    function confirm(user, role, next) {
      var msg = 'Found user:\n' +
        '\tname: ' + user.name + ',\n' +
        '\temail: ' + user.email + '\n' +
        'Do you still want to remove "' + role.name + '" role ? (y/n) ? ';
      program.confirm(msg, function(ok) {
        if(ok) {
          return next(null, role, user);
        }
        app.logger.warn('Aborting...');
        return process.exit();
      });
    },
    function removeRole(selectedRole, user, next) {
      user.populate('roles', function(err, user) {
        if(err) {
          return next(err);
        }
        var userRole = _.find(user.roles, {name: selectedRole.name});
        if(!userRole) {
          app.logger.warn('User has no role: ' + selectedRole.name);
          return process.exit();
        }
        var index = user.roles.indexOf(userRole);
        user.roles.splice(index, 1);
        user.markModified('roles');
        user.save(function(err, user) {
          if(err) {
            return next(err);
          }
          app.logger.info('Role removed !');
          return next();
        });
      });
    }
  ],function(err) {
    if(err) {
      throw err;
    }
    app.logger.info('Done !');
    process.exit();
  });

};
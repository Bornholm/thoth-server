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
        'Do you still want to grant "' + role.name + '" role ? (y/n) ? ';
      program.confirm(msg, function(ok) {
        if(ok) {
          return next(null, role, user);
        }
        app.logger.warn('Aborting...');
        process.exit();
      });
    },
    function grantRole(role, user, next) {
      user.roles.push(role);
      user.markModified('roles');
      user.save(function(err, user) {
        if(err) {
          return next(err);
        }
        user.hasRole(role, function(err, has) {
          if(err) {
            return next(err);
          }
          if(has) {
            app.logger.info('Role correctly set !');
            return next();
          } else {
            return next(new Error('Role not set !'));
          }
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
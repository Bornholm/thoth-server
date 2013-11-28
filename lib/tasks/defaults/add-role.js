var async = require('async');
var _ = require('lodash');

module.exports = exports = function(app, program) {

  var User = app.api.models.User;

  async.waterfall([
    function askUserEmail(next) {
      program.prompt('Please enter user\'s email: ', next.bind(null, null));
    },
    function findUserByEmail(email, next) {
      User.findOne({email: email}, function(err, user) {
        if(err) {
          return next(err);
        }
        if(user) {
          return next(null, user);
        } else {
          app.logger.warn('No user registered with email "' + email + '" !');
          app.logger.warn('Aborting...');
          process.exit();
        }
      });
    },
    function askRole(user, next) {
      var rbac = require('mongoose-rbac');
      rbac.Role.find(function(err, roles) {
        if(err) {
          return next(err);
        }
        console.log('Choose the role to add:');
        program.choose(_.pluck(roles, 'name'), function(i) {
          return next(null, user, roles[i]);
        });
      });
    },
    function confirm(user, role, next) {
      var msg = 'Found user:\n' +
        '\tname: ' + user.name + ',\n' +
        '\temail: ' + user.email + '\n' +
        'Do you still want to grant him "' + role.name + '" role ? (y/n) ? ';
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
var _ = require('lodash');

module.exports = function(app, program) {

  var common = {};

  var User = app.api.models.User;

  common.askUserEmail = function(next) {
    program.prompt('Please enter user\'s email: ', next.bind(null, null));
  };

  common.findUserByEmail = function(email, next) {
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
  };

  common.askRole = function(user, next) {
    var rbac = require('mongoose-rbac');
    rbac.Role.find(function(err, roles) {
      if(err) {
        return next(err);
      }
      console.log('Choose the role:');
      program.choose(_.pluck(roles, 'name'), function(i) {
        return next(null, user, roles[i]);
      });
    });
  };


  return common;

}


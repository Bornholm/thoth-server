var async = require('async');

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
    function confirmUser(user, next) {
      var msg = 'Found user:\n' +
        '\tname: ' + user.name + ',\n' +
        '\temail: ' + user.email + '\n' +
        'Do you still want to grant him admin access ? (y/n) ? ';
      program.confirm(msg, function(ok) {
        if(ok) {
          return next(null, user);
        }
        app.logger.warn('Aborting...');
        process.exit();
      });
    },
    function setUserAsAdmin(user, next) {
      user.addRole('admin', next);
    }
  ],function(err) {
    if(err) {
      throw err;
    }
    app.logger.info('Done !');
    process.exit();
  });

};
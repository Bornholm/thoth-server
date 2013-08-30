var async = require('async');

module.exports = exports = function(app, program) {

  console.log('Defining an account');

  var User = app.api.models.User;

  async.waterfall([
    function askUserEmail(next) {
      program.prompt('User email: ', next.bind(null, null));
    },
    function findUserByEmail(email, next) {
      User.findOne({email: email}, function(err, user) {
        if(err) {
          return next(err);
        }
        if(user) {
          return next(null, user);
        } else {
          console.log('No user registered with email "' + email + '" !');
          process.exit();
        }
      });
    },
    function confirmUser(user, next) {
      var msg = 'Found user ' +
        '(name: ' + user.name + ', ' +
        'email: ' + user.email + '). ' +
        'Do you still want to grant him admin access ? (y/n) ? ';
      program.confirm(msg, function(ok) {
        if(ok) {
          return next(null, user);
        }
        console.log('Aborting...');
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
    console.log('Done !');
    process.exit();
  });

};
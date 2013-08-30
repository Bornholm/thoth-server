var async = require('async');

module.exports = exports = function(app, program) {

  console.log('Creating new admin account...');

  async.waterfall([
    function askAdminUsername(next) {
      program.prompt('Username: ', next.bind(null, null));
    },
    function askAdminPassword(username, next) {
      program.password('Password: ', '*', next.bind(null, null, username));
    },
    function askAdminPassword2ndTime(username, password, next) {
      program.password('Password (just to be sure): ', '*', function(password2) {
        if(password !== password2) {
          return next(new Error('Passwords mismatch !'));
        }
        next(null, username, password);
      });
    },
    function confirm(username, password, next) {
      var msg = 'Will create new admin account ' +
        username + '/' + password.replace(/./g, '*') +
        '. Continue (y/n) ? ';
      program.confirm(msg, function(ok) {
        if(ok) {
          return next(null, username, password);
        }
        console.log('Aborting...');
        process.exit();
      });
    },
    function createAdminUser(username, password, next) {
      var User = app.api.models.User;
      var user = new User();
      user.auth.local = {
        password: password,
        username: username
      };
      user.markModified('auth');
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
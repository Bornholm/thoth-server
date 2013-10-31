var async = require('async');

module.exports = function(pluginOpts, api, client) {

  var User = api.models.User;

  api.tasks.registerTask(
    'ldap:create-user',
    function(app, program)  {
      
      app.logger.info('Registering LDAP User');

      async.waterfall([
        function askUserDn(next) {
          program.prompt('Please enter user\'s DN: ', next.bind(null, null));
        },
        function confirmDn(userDn, next) {
          var msg = 'User DN:\n' +
            '\t' + userDn + ',\n' +
            'Do you still want to create user ? (y/n) ? ';
          program.confirm(msg, function(ok) {
            if(ok) {
              return next(null, userDn);
            }
            app.logger.warn('Aborting...');
            return process.exit(1);
          });
        },
        function createUser(userDn, next) {
          
          var user = new User();

          user.auth = {
            ldap: {
              dn: userDn
            }
          };

          user.save(function(err) {
            if(err) {
              return next(err);
            }
            api.logger.info('User saved.');
            return next();
          });

        }
      ], function(err) {

        if(err) {
          api.logger.error(err.stack);
          return process.exit(1);
        }

        app.logger.info('Done !');
        return process.exit();

      });


    },
    'Register a LDAP user with his DN'
  );

};
module.exports = function(pluginOpts, api, client) {

  var dn = pluginOpts.dn;
  var scope = pluginOpts.scope;
  var User = api.models.User;
  var createUser = pluginOpts.createUser;
  var validator = new RegExp(pluginOpts.validator || '');
  var accessRights = api.config.get('access-rights') || {};
  var crypto = require('crypto');
  var cache = require('./cache');
  var cacheTimeout = 'cacheTimeout' in pluginOpts ? pluginOpts.cacheTimeout : 30000;

  var autoComplete = pluginOpts.autoComplete;

  var slice = Array.prototype.slice;
  function hashArgs() {
    var args = slice.call(arguments);
    var shasum = crypto.createHash('sha256');
    shasum.update(args.join(':'), 'utf8');
    return shasum.digest('base64');
  }

  function findUserByDn(userDn, cb) {
    User.findOne({'auth.ldap.dn': userDn}, cb);
  }

  api.auth.registerAuthBackend('ldap', {

    authenticate: function(username, password, cb) {

      var isUsernameValid = validator.test(username);
      if(!isUsernameValid) {
        return cb(new Error('Invalid username format !'));
      }

      var credentialsHash = hashArgs(username, password);
      var userDn = cache.get(credentialsHash);

      if(userDn) {
        api.logger.debug('Found user in LDAP cache !', {user: username});
        return findUserByDn(userDn, function(err, user) {
          if(err) {
            return cb(err);
          }
          return cb(null, user);
        });

      } else {
        api.logger.debug('LDAP cache timed out. Querying LDAP backend...');
        var filter = pluginOpts.filter.replace('${username}', username);
        
        var opts = {
          filter: filter,
          scope: scope
        };

        client.search(dn, opts, function(err, res) {

          if(err) {
            return cb(err);
          }

          // We have a match in LDAP
          res.once('searchEntry', function(entry) {

            res.removeAllListeners();

            var userDn = entry.object.dn;

            // Try to bind with user password & dn
            client.bind(userDn, password, function(err) {
              if(err) {
                return cb(err);
              }
              findUserByDn(userDn, function(err, user) {
                if(err) {
                  return cb(err);
                }

                cache.set(credentialsHash, userDn, cacheTimeout);
                if(user && autoComplete) {
                  var nameField = pluginOpts.nameField;
                  var emailField = pluginOpts.emailField;
                  user.name = entry.object[nameField];
                  user.email = entry.object[emailField];
                  user.save(function(err, user) {
                    if(err) {
                      return cb(err);
                    }
                    return cb(null, user);
                  });
                } else {
                  return cb(null, user);
                }
                
              });
            });

          });

          // Error occured
          res.once('error', function(err) {
            res.removeAllListeners();
            cb(err);
          });

          // User doesn't exist in LDAP
          res.once('end', function(err) {
            res.removeAllListeners();
            cb(null, false);
          });

        });
      }

    },

    register: function(username, password, cb) {
      cb();
    }
    
  });

};
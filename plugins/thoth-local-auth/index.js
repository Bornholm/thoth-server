var bcrypt = require('bcrypt');

module.exports = exports = {

  load: function(opts, next) {

    var api = this.api;
    var User = api.models.User;

    User.schema.pre('save', function(next) {
      var user = this;
      var password = user.auth.local.password;
      if(password) {
        bcrypt.hash(password, opts.rounds || 8, function(err, hash) {
          if(err) {
            return next(err);
          }
          delete user.auth.local.password;
          user.auth.local.hash = hash;
          user.markModified('auth');
          next();
        })
      } else {
        return next();
      }
    });

    api.auth.registerAuthBackend('local', {
    
      authenticate: function(username, password, cb) {
        User.findOne({'auth.local.username': username}, function(err, user) {
          if(err) return cb(err);
          if(user) {
            try {
              bcrypt.compare(
                password, 
                user.auth.local.hash, 
                function(err, res) {
                  if(err) {
                    return cb(err);
                  }
                  if(res) {
                    return cb(null, user);
                  }
                  return cb(null, false);
                }
              );
            } catch(err) {
              return cb(err);
            }
          } else {
            return cb(null, false);
          }
        });
      },

      register: function(username, password, cb) {}

    });

    process.nextTick(next);
    
  }

}
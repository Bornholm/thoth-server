var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var User = require('../../models').User;

module.exports = function authenticate(credentials) {

  return new Promise(function(resolve, reject) {

    var userName = credentials.name;

    User.query({
        where: {
          name: userName
        },
        orWhere: {
          email: userName
        }
      })
      .fetch()
      .then(userHandler)
      .catch(reject)
    ;

    // Internal methods

    function userHandler(user) {

      if(!user) return resolve(null);

      var passwordHash = user.get('password_hash');

      if(!passwordHash) {
        return resolve(null);
      }

      bcrypt.compare(
        credentials.pass,
        passwordHash,
        passwdCompareHandler.bind(user)
      );

    }

    function passwdCompareHandler(err, result) {
      if(err) return reject(err);
      return resolve(result ? this : null);
    }

  });

};

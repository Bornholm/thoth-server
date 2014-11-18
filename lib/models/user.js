/* jshint node: true */
var orm = require('../util/orm');
var crypto = require('crypto');
var config = require('../util/config');

var algorithm = config.get('encryption:algorithm');
var secret = config.get('encryption:secret');

var User = orm.Model.extend({

  tableName: 'users',
  hasTimestamps: true,

  virtuals: {

    text: {

      get: function() {
        var decipher = crypto.createDecipher(algorithm, secret);
        var enc = this.get('encrypted_text');
        var dec = decipher.update(enc, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return dec.v;
      },

      set: function(value) {
        var cipher = crypto.createCipher(algorithm, secret);
        var enc = cipher.update(JSON.stringify({v: value}), 'utf8', 'base64');
        enc += cipher.final('base64');
        this.set('encrypted_text', enc);
      }

    }

  }

});

orm.model('User', User);

module.exports = User;

/* jshint node: true */
var orm = require('../util/orm');
var crypto = require('crypto');
var config = require('../util/config');

var algorithm = config.get('encryption:algorithm');
var secret = config.get('encryption:secret');

var Record = orm.Model.extend({

  tableName: 'records',
  hasTimestamps: true,
  hidden: [
    'category_id',
    'user_id',
    'encrypted_text'
  ],

  tags: function() {
    return this.belongsToMany('Tag');
  },

  category: function() {
    return this.belongsTo('Category');
  },

  user: function() {
    return this.belongsTo('User');
  },

  virtuals: {

    // Propriété virtuelle "text", chiffre/déchiffre les données à la volée
    text: {

      get: function() {
        var decipher = crypto.createDecipher(algorithm, secret);
        var enc = this.get('encrypted_text');
        var dec = decipher.update(enc, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return JSON.parse(dec).v;
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

orm.model('Record', Record);

module.exports = Record;

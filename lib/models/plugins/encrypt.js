var crypto = require('crypto');
var async = require('async');

var plugin = function encryptedPlugin(schema, options) {

	options = options || {};
	var encFields = options.fields || [];
	var	secret = options.secret || plugin.defaults.secret;
	var algorithm = options.algorithm || plugin.defaults.algorithm;

  function encrypt() {
    var self = this;
    encFields.forEach(function(fieldName) {
      var cipher = crypto.createCipher(algorithm, secret);
      var field = self[fieldName];
      var enc = cipher.update(field, 'utf8', 'base64');
      enc += cipher.final('base64');
      self[fieldName] = enc;
    });
    return self;
  }

  function decrypt() {
    var self = this;
    encFields.forEach(function(fieldName) {
      var decipher = crypto.createDecipher(algorithm, secret);
      var field = self[fieldName];
     var dec = decipher.update(field, 'base64', 'utf8');
      dec += decipher.final('utf8');
      self[fieldName] = dec;
    });
    return self;
  }

  schema.pre('save', function (next) {
    encrypt.call(this);
    next()
  });

  schema.pre('init', function(next, data) {
  	decrypt.call(data);
		next();
	});

  schema.methods.encrypt = encrypt;
  schema.methods.decrypt = decrypt;
  
}

plugin.defaults = {
  secret: 'barba crescit, caput nescit',
  algorithm: 'aes256'
};

module.exports = exports = plugin;


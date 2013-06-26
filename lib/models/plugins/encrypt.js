var crypto = require('crypto');
var async = require('async');

var plugin = function encryptedPlugin(schema, options) {

	options = options || {};
	var encFields = options.fields || [];
	var	secret = options.secret || plugin.defaults.secret;
	var algorithm = options.algorithm || plugin.defaults.algorithm;
  
  schema.pre('save', function (next) {
  	var self = this;
  	encFields.forEach(function(fieldName) {
  		var cipher = crypto.createCipher(algorithm, secret);
  		var field = self[fieldName];
  		cipher.update(field, 'utf8', 'base64');
  		var enc = cipher.final('base64');
  		self[fieldName] = enc;
  	});
    next()
  });

  schema.pre('init', function(next, data) {
  	encFields.forEach(function(fieldName) {
  		var decipher = crypto.createDecipher(algorithm, secret);
  		var field = data[fieldName];
  		decipher.update(field, 'base64', 'utf8');
  		var dec = decipher.final('utf8');
  		data[fieldName] = dec;
  	});
		next();
	});
  
  if (options && options.index) {
    schema.path('createdAt').index(options.index)
  }
  
}

plugin.defaults = {
  secret: 'barba crescit, caput nescit',
  algorithm: 'aes256'
};

module.exports = exports = plugin;


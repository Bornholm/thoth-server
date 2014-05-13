var config = require('./config');
var program = require('commander');

exports.getPassphrase = function(cb) {
  var passphrase = config.get('encryption:passphrase');
  if(passphrase) {
    return cb(null, passphrase);
  } else {
    return program.password(
      'Please enter passphrase: ', 
      '*', 
      function(passphrase) {
        if(!passphrase) {
          return cb(new Error('Passphrase shouldn\'t be empty !'));
        }
        return cb(null, passphrase);
      }
    );
  }
}
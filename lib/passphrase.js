var program = require('commander');
var crypto = require('crypto');

exports.askPassphrase = function(cb) {
	program.password("Please enter encryption passphrase: ", '*', function(answer) {
	  process.stdin.destroy();
	  cb && cb(answer);
	});
}
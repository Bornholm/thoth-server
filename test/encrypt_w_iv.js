var crypto = require('crypto');
var util = require('util');

var algorithm = 'aes-256-cbc';
var pbkdf2Iterations = 1000;
var pbkdf2Salt = new Buffer('test', 'utf8');
var password = 'password';
var keyLength = 32;
var ivLength = 16;

console.log('algorithm:', algorithm);

crypto.randomBytes(ivLength, function(err, iv) {

  console.log('iv:', iv.toString('hex'));
  
  crypto.pbkdf2(password, pbkdf2Salt, pbkdf2Iterations, keyLength, function(err, key) {

    console.log('key:', key.toString('hex'));
    
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var enc = cipher.update('test', 'utf8', 'base64');
    enc += cipher.final('base64');

    console.log('enc:', enc);

    var cipher = crypto.createDecipheriv(algorithm, key, iv);
    var dec = cipher.update(enc, 'base64', 'utf8');
    dec += cipher.final('utf8');

    console.log('dec:', dec);

    console.log(
      "Decrypt with \n",
      util.format(
        'echo %s | openssl enc -d -a -%s -K %s -iv %s',
        enc,
        algorithm,
        key.toString('hex'),
        iv.toString('hex')
      )
    );

  });

});


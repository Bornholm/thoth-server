var crypto = require('crypto');
var util = require('util');

var password = "password";
var algorithm = "aes-256-cbc";
var data = "Test";

console.log('data:', data);
console.log('algorithm:', algorithm);
console.log('password:', password);

var crypto = require("crypto");
var cypher = crypto.createCipher(algorithm, password);
var enc = cypher.update(data,"utf8", "base64");
enc += cypher.final("base64");

console.log('enc data:', enc);

console.log(
  "Decrypt with \n",
  util.format(
    'echo %s | openssl enc -d -a -%s -nosalt -k %s',
    enc,
    algorithm,
    password
  )
);
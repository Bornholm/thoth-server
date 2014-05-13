
var path = require('path');
var nconf = require('nconf');
var os = require('os');
var jsYAML = require('js-yaml');

var YAMLFormat = {
  parse: jsYAML.safeLoad,
  stringify: jsYAML.safeDump
};

nconf
    .env('__')
    .argv();

// Load configuration files defaults.yaml -> $ENV.yaml -> $HOSTNAME.yaml
var configDir = nconf.get('configDir') || 'config';

nconf.file('host', {
  file: path.join(configDir, os.hostname() + '.yaml'),
  format: YAMLFormat
});

nconf.file('environment', {
  file: path.join(configDir, process.env.NODE_ENV + '.yaml'),
  format: YAMLFormat
});

nconf.file('defaults', {
  file: path.join(configDir, 'defaults.yaml'),
  format: YAMLFormat
});


module.exports = exports = nconf;
/* jshint node: true */
var path = require('path');
var os = require('os');
var nconf = require('nconf');
var vm = require('vm');

// Handle JS config file
var jsFormat = {

  stringify: function(obj) {
    return 'module.exports = ' + JSON.stringify(obj, null, 2) + ';';
  },

  parse: function(str) {
    var exports = {};
    var sandbox = {
      module: {
        exports: exports
      },
      exports: exports
    };
    vm.runInNewContext(str, sandbox);
    return sandbox.module.exports || sandbox.exports;
  }

};

// Config hierarchy:
// config/defaults.js -> config/{hostname}.js -> config/{env}.js -> env -> args

nconf
  .argv()
  .env();

var configDir = nconf.get('configDir') || 'config';

nconf.file('environment', {
  file: path.join(configDir, process.env.NODE_ENV + '.js'),
  format: jsFormat
});

nconf.file('host', {
  file: path.join(configDir, os.hostname() + '.js'),
  format: jsFormat
});

nconf.file('defaults', {
  file: path.join(configDir, 'defaults.js'),
  format: jsFormat
});

module.exports = nconf;
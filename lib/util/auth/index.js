var defaultBackend = require('./default-backend');

var _backends = {};
exports.addBackend = function(name, authFn) {
  _backends[name] = authFn;
};

exports.getBackends = function() {
  return _backends;
};

exports.addBackend('default', defaultBackend);

exports.middleware = require('./middleware');

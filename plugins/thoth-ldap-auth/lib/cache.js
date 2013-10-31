
var _timeouts = {};
var _cache = {};

exports.get = function(key) {
  var timeout = _timeouts[key];
  if(timeout !== undefined &&  timeout < Date.now()) {
    delete _cache[key];
    delete _timeouts[key];
    return;
  }
  return _cache[key];
};

exports.set = function(key, value, timeout) {
  _cache[key] = value;
  if(_timeouts !== undefined) {
    _timeouts[key] = Date.now() + timeout;
  }
};
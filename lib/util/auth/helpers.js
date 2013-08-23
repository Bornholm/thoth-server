var helpers = {};

var backends = {};
helpers.registerAuthBackend = function(authType, backend) {
	backends[authType] = backend;
};

helpers.getAuthBackend = function(authType) {
	return backends[authType];
}

module.exports = exports = helpers;
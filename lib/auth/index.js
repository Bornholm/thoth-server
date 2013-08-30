var auth = {};

var backends = {};
auth.registerAuthBackend = function(authType, backend) {
	backends[authType] = backend;
};

auth.getAuthBackend = function(authType) {
	return backends[authType];
}

module.exports = exports = auth;
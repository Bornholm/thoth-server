var helpers = {};

var authStrategies = {};
helpers.registerAuthStrategy = function(name, strategy) {
	authStrategies[name] = strategy;
};

helpers.getAuthStrategy = function(name) {
	return authStrategies[name];
}

module.exports = exports = helpers;
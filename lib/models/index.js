exports.initialize = function(sequelize) {
	exports.User = require('./user')(sequelize);
};
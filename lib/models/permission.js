
module.exports = function(sequelize, DataTypes) {

	return sequelize.define('Permission', {
		allow: DataTypes.ENUM('read', 'write')
	});

};
module.exports = function(sequelize, DataTypes) {

	return sequelize.define('Group', {
		label: DataTypes.STRING
	});

};
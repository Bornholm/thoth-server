module.exports = function(sequelize, DataTypes) {

	return sequelize.define('Property', {
		label: DataTypes.STRING,
		value: DataTypes.TEXT
	});

};
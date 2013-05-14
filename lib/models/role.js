module.exports = function(sequelize, DataTypes) {

	return sequelize.define('Role', {
		label: DataTypes.STRING
	});

};
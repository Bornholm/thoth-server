module.exports = function(sequelize, DataTypes) {

	return sequelize.define('Record', {
		label: DataTypes.STRING
	});

};
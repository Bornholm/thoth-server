module.exports = function(sequelize, DataTypes) {

	return sequelize.define('User', {
		name: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			isEmail: true,
			unique: true
		},
		password: DataTypes.STRING
	});

};
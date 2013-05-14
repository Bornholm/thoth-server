exports.initialize = function(sequelize) {

	var User = exports.User = sequelize.import(__dirname + '/user.js');
	var Permission = exports.Permission = sequelize.import(__dirname + '/permission.js');
	var Role = exports.Role = sequelize.import(__dirname + '/role.js');
	var Property = exports.Property = sequelize.import(__dirname + '/property.js');
	var Record = exports.Record = sequelize.import(__dirname + '/record.js');
	var Group = exports.Group = sequelize.import(__dirname + '/group.js');

	// Relations

	Record.hasMany(Property);

	Group.hasMany(Record);
	Record.hasMany(Group);

	User.hasMany(Role);
	Role.hasMany(User);

	Permission.hasMany(Record);
	Record.hasMany(Permission);

	Role.hasMany(Permission);
	User.hasMany(Permission);

	sequelize.sync();

};
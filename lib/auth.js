
exports.checkUserAuth = function(user, password) {
	console.log(arguments);
	return 'test' === user && 'test' === password;
};
var models = require('./models');

exports.checkUserAuth = function(email, password, cb) {
	models.User.find({where: {email: email}}).success(cb);
};
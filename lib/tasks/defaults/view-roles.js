var async = require('async');
var _ = require('lodash');

module.exports = exports = function(app, program) {

  var common = require('./common')(app, program);

  async.waterfall([
    common.askUserEmail,
    common.findUserByEmail,
    function displayRoles(user, next) {
			user.populate('roles',function(err,user){
				if(err) {
					return next(err);
				}
      	var msg = 'Found user:\n' +
        	'\tname: ' + user.name + ',\n' +
	        '\temail: ' + user.email + '\n' +
  	      '\tRoles: ' + _.pluck(user.roles,'name');
				console.log(msg);
				return next();
			});
    }
  ],function(err) {
    if(err) {
      throw err;
    }
    app.logger.info('Done !');
    process.exit();
  });

};

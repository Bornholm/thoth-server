var mongoose = require('mongoose');
var rbac = require('mongoose-rbac');
var async = require('async');
var config = require('config');

// Permissions

var readOnly = [
	{ subject: 'Record', action: 'read' },
	{ subject: 'User', action: 'read' },
	{ subject: 'Tags', action: 'read' }
];

var recordCreator = [
	{ subject: 'Record', action: 'create' },
	{ subject: 'Record', action: 'update' }
];

var userCreator = [
	{ subject: 'User', action: 'create' },
	{ subject: 'User', action: 'update' }
];

var tagCreator = [
	{ subject: 'Tag', action: 'create' },
	{ subject: 'Tag', action: 'update' }
];

// Open database connection
mongoose.connect(config.database);
var db = mongoose.connection;

db.on('error', console.error.bind(console, "Couldn't connect to database !"));

db.once('open', function() {

	rbac.init({
		admin: readOnly.concat(recordCreator, userCreator, tagCreator),
		reader: readOnly,
		'user-creator': userCreator,
		'record-creator': recordCreator,
		'tag-creator': tagCreator
	}, function(err) {
		if(err) {
			console.error(err);
		} else console.log('Done !');
		console.log(arguments);
		process.exit()
	});
	
});


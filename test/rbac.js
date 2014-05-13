var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var mongoose = require('mongoose');
var rbac = require('mongoose-rbac');


var User;

async.series([

  function connectToDB(next) {
    mongoose.connect('mongodb://localhost/thoth-test');
    mongoose.connection.once('open', next)
  },

  function cleanDB(next) {
    mongoose.connection.db.dropDatabase(next);
  },

  function createUser(next) {

    var schema = new Schema({
      email: String  
    });

    schema.plugin(rbac.plugin);

    User = mongoose.model('User', schema);

    return next();

  },

  function initRBAC(next) {

    rbac.init({
      admin: [
        {subject: 'record', action: 'CREATE'}
      ]
    }, next)
  },

  function createAdmin(next) {

    var admin = new User();
    admin.email = 'root@localhost';
    admin.save(next)

  },

  function addRole(next) {

    User.findOne({email: 'root@localhost'}, function(err, admin) {
      if(err) return next(err);
      admin.addRole('admin', next)
    });

  },

  function testPermissions(next) {

    User.findOne({email: 'root@localhost'}, function(err, admin) {
      if(err) return next(err);
      console.log('User', admin);
      var actsAndSubs = [
        ['CREATE', 'record'],
        ['DELETE', 'record']
      ];
      admin.canAny(actsAndSubs, function(err, isAllowed) {
        if(err) return next(err);
        console.log('isAllowed', isAllowed);
        return next();
      });
    });

  }


], function(err) {
  if(err) console.error(err);
  process.exit()
})


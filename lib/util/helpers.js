var ops = require('./ops');
var check = require('validator').check;
var UnauthorizedError = require('./errors/unauthorized');
var UnknownResourceError = require('./errors/unknown-resource');
var DuplicateKeyError = require('./errors/duplicate-key');
var async = require('async');

function dummyUpdate(doc, update, done) { return done(null); }
function dummyTransform(results, done) { return done(null, results); }
function dummyControlAccess(user, doc, done) { return done(null, true); }

function getCategoriesForUser(user,subjects,op,cb){
	async.reduce(
		subjects,
		[],
		function(result, sub, next) {
			var joined = sub.join('.');
			var actsAndSubs = [
				['*', '*'],
				[op, '*'],
				['*', joined],
				[op, joined]
			];
			user.canAny(actsAndSubs, function(err, can) {
				if(err) {
					return next(err);
				}
				if(can) {
					result.push(sub);
				}
				return next(null, result);
			});
		},
		function(err, result) {
			typeof cb === 'function' && cb(err,result);
		}
	);
}

exports.getCategoriesForUser = getCategoriesForUser;

exports.getModelQueryHandler = function(Model, opts) {

  opts = opts || {};
  opts.searchFields = opts.searchFields || [];
  opts.transform = opts.transform || dummyTransform;

  return function(req, res, next) {

    var user = req.user;
    var skip = req.param('skip') || 0;
    var limit = req.param('limit') || 0;
    var search = req.param('search');

    try {
      skip && check(+skip, 'skip parameter must be a positive integer.').isNumeric().min(0);
      limit && check(+limit, 'limit parameter must be a positive integer.').isNumeric().min(0);
      search && check(search, 'search parameter must be an alphanumeric text.').is(/[^\*\(\)\{\}]/i);
    } catch(err) {
      return next(err);
    }

		
    var q = Model.find();

    if(search) {
      var or = [];
      var tokens = search.split(' ');
      if(tokens.length) {
        opts.searchFields.forEach(function(field) {
          var criteria = {};
          criteria[field] = new RegExp(tokens.join('|'), 'i');
          or.push(criteria);
        });
      }
      q.and([{'$or': or}]);
    }

		getCategoriesForUser(user,opts.subjects,ops.READ,function(err,userSubjects){
			var or = [];
			userSubjects.forEach(function(subject){
				var criteria = {};
				criteria['category'] = subject;
				or.push(criteria);
			});
			q.and([{'$or': or}]);

			if(skip){
				q.skip(skip);
			}

			if(limit){
				q.limit(limit);
			}

	    var stream = q.stream();
  	  var results = [];

  	  function onStreamError(err) {
    	  stream.removeAllListeners();
	      return next(err);
  	  }

    	function sendResults() {
      	stream.removeAllListeners();
	      opts.transform(results, function(err, results) {
  	      if(err) {
    	      return next(err);
      	  }
      	  return res.send(results);
	      });
  	  }

    	stream
      	.on('data', function(doc) {
					results.push(doc);
    	  })
      	.once('error', onStreamError)
	      .once('close', function() {
      	  return sendResults();
	      });
		});
  }

};

function handleSaveError(mongoErr, next) {
  switch(mongoErr.code) {
    case 11000:
    case 11001:
      return next(new DuplicateKeyError(mongoErr));
    break;
    default:
      // Unknown error, just return it
      return next(mongoErr);
    break;
  }
}

exports.getModelUpdateHandler = function(Model, opts) {

  opts = opts || {};
  opts.update = opts.update || dummyUpdate;
  opts.transform = opts.transform || dummyTransform;
  opts.controlAccess = opts.controlAccess || dummyControlAccess;

  return function(req, res, next) {

    var user = req.user;
    var itemFields = req.body;
    var docId = req.params.id;

    try {
      check(docId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    if(!itemFields) {
      return next(new InvalidRequestError());
    }

    if(itemFields && docId) {
      // Find wanted doc
      Model.findById(docId, function(err, doc){
        if(err) {
          return next(err);
        }
        opts.controlAccess(user, doc, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            if(doc) { // If doc exists, update it
              opts.update(doc, itemFields, function(err) {
                if(err) {
                  return next(err);
                }
                doc.save(function(err, doc) {
                  if(err) {
                    return handleSaveError(err, next);
                  }
                  opts.transform(doc, function(err, result) {
                    if(err) {
                      return next(err);
                    }
                    return res.send(result);
                  });
                });
              });
            } else {
              return next(new UnknownResourceError());
            }
          } else {
            return next(new UnauthorizedError());
          }
        });
      });
    } else {
      return next(new InvalidRequestError());
    }

  };
};

exports.getModelCreateHandler = function(Model, opts) {

  opts = opts || {};
  opts.update = opts.update || dummyUpdate;
  opts.transform = opts.transform || dummyTransform;
  opts.controlAccess = opts.controlAccess || dummyControlAccess;

  return function(req, res, next) {

    var user = req.user;
    var docFields = req.body;

    var newDoc = new Model();

    if(!docFields) {
      return next(new InvalidRequestError());
    }

    if(docFields) {
      opts.update(newDoc, docFields, function(err) {
        if(err) {
          return next(err);
        }
        opts.controlAccess(user, newDoc, function(err, isAllowed) {
          if(err) {
            return next(err);
          }

          if(isAllowed) {
            newDoc.creator = user;
            newDoc.save(function(err, newDoc) {
              if(err) {
                return handleSaveError(err, next);
              }
              opts.transform(newDoc, function(err, result) {
                if(err) {
                  return next(err);
                }
                return res.send(201, result);
              });
            });
          } else {
            return next(new UnauthorizedError());
          }
        });
      });
    } else {
      return next(new InvalidRequestError());
    }

  };

};

exports.getModelGetOneHandler = function(Model, opts) {

  opts = opts || {};
  opts.transform = opts.transform || dummyTransform;
  opts.controlAccess = opts.controlAccess || dummyControlAccess;

  return function(req, res, next) {

    var user = req.user;
    var docId = req.params.id;

    try {
      check(docId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    Model.findById(docId, function(err, doc){
      if(err) {
        return next(err);
      }
      if(doc) {
        opts.controlAccess(user, doc, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            opts.transform(doc, function(err, result) {
              if(err) {
                return next(err);
              }
              return res.send(result);
            });
          } else {
            return next(new UnauthorizedError());
          }
        });
      } else {
        return next(new UnknownResourceError());
      }
    });

  };

};

exports.getModelDeleteHandler = function(Model, opts) {

  opts = opts || {};
  opts.controlAccess = opts.controlAccess || dummyControlAccess;

  return function(req, res, next) {

    var user = req.user;
    var docId = req.params.id;

    try {
      check(docId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    Model.findById(docId, function(err, doc){
      if(err) {
        return next(err);
      }
      if(doc) {
        opts.controlAccess(user, doc, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            doc.remove(function(err) {
              if(err) {
                return next(err);
              }
              return res.send(204);
            });
          } else {
            return next(new UnauthorizedError());
          }
        });
      } else {
        return next(new UnknownResourceError());
      }
    });

  };

};

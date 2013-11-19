var ops = require('./ops');
var check = require('validator').check;
var UnauthorizedError = require('./errors/unauthorized');
var UnknownResourceError = require('./errors/unknown-resource');
var async = require('async');

function dummyUpdate(doc, update, done) { return done(null); }
function dummyTransform(doc, done) { return done(null, doc); }


exports.getModelStatsHandler = function(Model, opts) {

  opts = opts || {};
  opts.searchFields = opts.searchFields || [];

  return function(req, res, next) {

    var user = req.user;
    var search = req.param('search');

    try {
      search && check(search, 'search parameter must be an alphanumeric text.').is(/[^\*\(\)\{\}]/i);
    } catch(err) {
      return next(err);
    }

    var q = Model.count();

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

    user.limitQueryWithPermissions(q, ops.READ, function(err, q) {
      if(err) {
        return next(err);
      }
      q.exec(function(err, total) {
        if(err) {
          return next(err);
        }
        return res.send({total: total});
      });
    });

  }

};

exports.getModelQueryHandler = function(Model, opts) {

  opts = opts || {};
  opts.accessFilter = opts.accessFilter || {};
  opts.hiddenFields = opts.hiddenFields || [];
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

    if(skip) {
      q.skip(skip);
    }

    if(limit) {
      q.limit(limit)
    }

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

    user.limitQueryWithPermissions(q, ops.READ, function(err, q) {
      if(err) {
        return next(err);
      }
      q.exec(function(err, docs) {
        if(err) {
          return next(err);
        }
        async.map(docs, opts.transform, function(err, results) {
          if(err) {
            return next(err);
          }
          return res.send(results);
        });
      });
    });

  }

};

exports.getModelUpdateHandler = function(Model, opts) {

  opts = opts || {};
  opts.update = opts.update || dummyUpdate;
  opts.transform = opts.transform || dummyTransform;

  return function(req, res, next) {

    var user = req.user;
    var itemFields = req.body;
    var itemId = req.params.id;
    
    try {
      check(itemId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    if(!itemFields) {
      return next(new InvalidRequestError());
    }

    if(itemFields && itemId) {
      // Find wanted item
      Model.findById(itemId, function(err, item){
        if(err) {
          return next(err);
        }
        user.hasPermission(ops.UPDATE, item, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {

            if(item) { // If item exists, update it
              opts.update(item, itemFields, function(err) {
                if(err) {
                  return next(err);
                }
                item.save(function(err, item) {
                  if(err) {
                    return next(err);
                  }
                  opts.transform(item, function(err, result) {
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

  return function(req, res, next) {

    var user = req.user;
    var itemFields = req.body;

    var newItem = new Model();

    if(!itemFields) {
      return next(new InvalidRequestError());
    }

    if(itemFields) {
      opts.update(newItem, itemFields, function(err) {
        if(err) {
          return next(err);
        }
        user.hasPermission(ops.CREATE, newItem, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            newItem.creator = user;
            newItem.save(function(err, newItem) {
              if(err) {
                return next(err);
              }
              opts.transform(newItem, function(err, result) {
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

  return function(req, res, next) {

    var user = req.user;
    var itemId = req.params.id;

    try {
      check(itemId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    Model.findById(itemId, function(err, item){
      if(err) {
        return next(err);
      }
      if(item) {
        user.hasPermission(ops.READ, item, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            opts.transform(item, function(err, result) {
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

  return function(req, res, next) {

    var user = req.user;
    var itemId = req.params.id;

    try {
      check(itemId, 'id parameter must be an alphanumeric string.').isAlphanumeric().notEmpty();
    } catch(err) {
      return next(err);
    }

    Model.findById(itemId, function(err, item){
      if(err) {
        return next(err);
      }
      if(item) {
        user.hasPermission(ops.DELETE, item, function(err, isAllowed) {
          if(err) {
            return next(err);
          }
          if(isAllowed) {
            item.remove(function(err) {
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
var ops = require('./ops');
var check = require('validator').check;
var UnauthorizedError = require('./errors/unauthorized');
var async = require('async');

function noOp(model) { return model; }

exports.getModelQueryHandler = function(Model, opts) {

  opts = opts || {};
  opts.accessFilter = opts.accessFilter || {};
  opts.hiddenFields = opts.hiddenFields || [];
  opts.searchFields = opts.searchFields || [];
  opts.transform = opts.transform || noOp;

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
      q.exec(function(err, models) {
        if(err) {
          return next(err);
        }
        try {
          var results = models.map(opts.transform);
        } catch(err) {
          return next(err);
        }
        return res.send(results);
      });
    });

  }

};

exports.getModelUpdateHandler = function(Model, opts) {

  opts = opts || {};
  opts.update = opts.update || noOp;
  opts.transform = opts.transform || noOp;

  return function(req, res, next) {

    var user = req.user;
    var itemFields = req.body;
    var itemId = req.params.id;
    
    try {
      itemId && check(itemId, 'id parameter must be an alphanumeric string.').isAlphanumeric();
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
              try {
                opts.update(item, itemFields);
              } catch(err) {
                return next(err);
              }
              item.save(function(err, item) {
                if(err) {
                  return next(err);
                }
                try {
                  var result = opts.transform(item);
                } catch(err) {
                  return next(err);
                }
                return res.send(200, result);
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
  opts.update = opts.update || noOp;
  opts.transform = opts.transform || noOp;

  return function(req, res, next) {

    var user = req.user;
    var itemFields = req.body;

    var newItem = new Model();

    if(!itemFields) {
      return next(new InvalidRequestError());
    }

    if(itemFields) {
      user.hasPermission(ops.CREATE, newItem, function(err, isAllowed) {
        if(err) {
          return next(err);
        }
        if(isAllowed) {
          try {
            opts.update(newItem, itemFields);
          } catch(err) {
            return next(err);
          }
          newItem.save(function(err, newItem) {
            if(err) {
              return next(err);
            }
            try {
              var result = opts.transform(newItem);
            } catch(err) {
              return next(err);
            }
            return res.send(201, result);
          });
        } else {
          return next(new UnauthorizedError());
        }
      });
    } else {
      return next(new InvalidRequestError());
    }

  };

};
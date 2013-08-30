var ops = require('./ops');
var check = require('validator').check;
var UnauthorizedError = require('./errors/unauthorized');
var async = require('async');

exports.getModelQueryHandler = function(Model, opts) {

  opts = opts || {};
  opts.accessFilter = opts.accessFilter || {};
  opts.hiddenFields = opts.hiddenFields || [];
  opts.searchFields = opts.searchFields || [];

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
      q.or(or);
    }

    q.exec(function(err, models) {
      if(err) {
        return next(err);
      }
      async.reduce(
        models,
        [], 
        function(memo, model, cb) {
          user.hasPermission(ops.READ, model, function(err, isAllowed) {
            if(err) {
              return next(err);
            }
            if(isAllowed) {
              memo.push(model);
            }
            return cb(null, memo);
          });
        }, 
        function(err, results) {
          if(err) {
            return next(err);
          }
          return res.send(results);
        }
      );
      
    });

  }

}
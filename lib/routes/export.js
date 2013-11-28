var zlib = require('zlib');
var archiver = require('archiver');
var Record = require('../models/record');
var crypto = require("crypto");
var InvalidRequestError = require('../util/errors/invalid-request');
var check = require('validator').check;
var ops = require('../util/ops');
var moment = require('moment');
var _ = require('lodash');

module.exports = exports = function(app, api) {

  var algorithm = api.config.get('encryption:algorithm') || 'aes256';

  app.get('/export/all', function(req, res, next) {

    var user = req.user;
    var passphrase = req.query.passphrase;

    try {
      check(passphrase, 'passphrase parameter must be an alphanumeric string.').isAlphanumeric().notNull();
    } catch(err) {
      return next(err);
    }

    var filename = 'export_' + moment().format('YYYYMMDD') + '.tar.gz.enc';
    res.set('Content-Disposition', 'attachment; filename=' + filename);
    res.set('Content-Type', 'application/octet-stream');

    var cipher = crypto.createCipher(algorithm, passphrase);
    cipher.setAutoPadding(true);
    
    var archive = archiver('tar');
    var gzipper = zlib.createGzip();

    archive
      .pipe(gzipper)
      .pipe(cipher)
      .pipe(res);

    var query = Record.find();

    var validating = 0;
    var isStreamClosed = false;
    var stream = query.populate('creator', 'email').stream();

    function onStreamError(err) {
      stream.removeAllListeners();
      return next(err);
    }

    function finalize() {
      stream.removeAllListeners();
      return archive.finalize();
    }

    stream
      .on('data', function(record) {

        validating++;

        var categories = record.getIncludingCategories();
        var actsAndSubs = categories.map(function(cat) {
          return [ops.READ, cat.join('.')];
        });

        user.canAny(actsAndSubs, function(err, can) {

          if(err) {
            return onStreamError(err);
          }

          if(can) {
            archive.append(
              JSON.stringify(record),
              {
                name: record.label + '_' + record._id + '.json',
                data: record.lastUpdate
              },
              function(err) {
                if(err) {
                  return onStreamError(err);
                }
                validating--;
                if(isStreamClosed && validating === 0) {
                  return finalize();
                }
              }
            );
          } else {
            validating--;
            if(isStreamClosed && validating === 0) {
              return finalize();
            }
          }

        });

        
      })
      .once('error', onStreamError)
      .once('close', function() {
        isStreamClosed = true;
        if(validating === 0) {
          return finalize();
        }
      });

  });  

};
var zlib = require('zlib');
var archiver = require('archiver');
var Record = require('../models/record');
var crypto = require("crypto");
var InvalidRequestError = require('../util/errors/invalid-request');
var check = require('validator').check;
var ops = require('../util/ops');
var moment = require('moment');

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
    var archive = archiver('tar');
    var gzipper = zlib.createGzip();

    archive.pipe(gzipper).pipe(cipher).pipe(res);

    var query = Record.find();

    user.limitQueryWithPermissions(query, ops.READ, function(err, query) {

      if(err) {
        return next(err);
      }

      var recordStream = query.stream();

      recordStream.on('data', function(record) {
        var content = 'tags: ' + record.tags.join(', ') + '\n';
        content += 'creation-date: ' + record.createdAt + '\n';
        content += 'last-update: ' + record.updatedAt + '\n';
        content += '\n';
        content += record.text;
        archive.append(
          content,
          {name: record.label + '' + record._id + '.txt'}
        );
      });

      recordStream.once('close', archive.finalize.bind(archive));

    });

  });  

};
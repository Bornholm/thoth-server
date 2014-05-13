var archiver = require('archiver');
var Record = require('../models/record');
var crypto = require("crypto");
var InvalidRequestError = require('../util/errors/invalid-request');
var check = require('validator').check;
var ops = require('../util/ops');
var moment = require('moment');
var _ = require('lodash');


/*
  Service exportant l'ensemble des Records dans une archive chiffrée.
  Un fichier par Record, au format Markdown.
*/
module.exports = exports = function(app, api) {

  // Algorithme de chiffrement, le même que celui utilisé par la base de données
  var algorithm = api.config.get('encryption:algorithm') || 'aes256';
  // Template du fichier Markdown, possibilité de le modifier dans la configuration
  var mdTemplate = _.template(api.config.get('export:template') || 'No template defined in configuration !');

  // GET /export/all?passphrase=<Alphanumeric|Not null>
  app.get('/export/all', function(req, res, next) {

    var user = req.user;
    var passphrase = req.query.passphrase;

    try {
      // On vérifie que la passphrase est bien au format alphanumérique et non nulle
      check(passphrase, 'passphrase parameter must be an alphanumeric string.').isAlphanumeric().notNull();
    } catch(err) {
      return next(err);
    }

    // Nom du fichier téléchargé: thoth_export_<date>.tar.gz.<algorithme_chiffrement>
    var filename = 'thoth_export_' + moment().format('YYYYMMDD') + '.tar.gz.'+algorithm;
    res.set('Content-Disposition', 'attachment; filename=' + filename);
    res.set('Content-Type', 'application/octet-stream');

    var cipher = crypto.createCipher(algorithm, passphrase);
    cipher.setAutoPadding(true);
    
    // Création de l'archive .tar.gz
    var archive = archiver.create('tar', {
      gzip: true,
      gzipOptions: {
        level: 9
      }
    });

    // On 'pipe' l'archive dans le stream de chiffrement
    // qui est lui même branché sur la réponse
    archive
      .pipe(cipher)
      .pipe(res);

    // Compteur des records en court de validation
    var validating = 0;

    var isStreamClosed = false;

    // Création de la requête en mode 'stream'
    var queryStream = Record.find().populate('creator', 'email').stream();


    function onStreamError(err) {
      queryStream.removeAllListeners();
      return next(err);
    }

    function finalize() {
      queryStream.removeAllListeners();
      return archive.finalize();
    }

    function appendRecord(record) {
      var filename = record.label + '.md';
      archive.append(mdTemplate(record), {name: filename});
    }

    queryStream
      .on('data', function(record) { // Pour chaque record renvoyé par la requete

        // On incrémente le compteur de validation en cours des records
        validating++;

        // On récupère les catégories englobant le record
        var categories = record.getIncludingCategories();

        // Création du tableau de permissions pour la validation d'accès
        var actsAndSubs = categories.reduce(function(arr, cat) {
          var dotCat = cat.join('.');
          // Si l'utilisateur à le droit de lire la catégorie courante
          arr.push([ops.READ, dotCat]);
          // Si l'utilisateur à le droit de faire toute action
          // sur la catégorie courante
          arr.push(['*', dotCat]);
          return arr;
        }, []);

        user.canAny(actsAndSubs, function(err, can) {

          if(err) {
            return onStreamError(err);
          }
          // Si l'utilisateur à le droit de faire au moins une des 
          // actions définies précédement sur le record, on ajoute
          // le record dans l'archive
          if(can) {
            appendRecord(record);
          }

          validating--;
          // Si le stream est fermé et qu'il n'y a plus de record
          // en court de validation, on finalise l'archive
          if(isStreamClosed && validating === 0) {
            return finalize();
          }

        });

        
      })
      .once('error', onStreamError)
      .once('close', function() {
        isStreamClosed = true;
        // Si aucun record n'est en cours de validation
        // on finalise l'archive
        if(validating === 0) { 
          return finalize();
        }
      });

  });  

};
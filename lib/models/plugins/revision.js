var util = require('util');

var RevisionConflictError = function(revId, serverRevId) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "RevisionConflictError";
  this.message = "Your revision is conflicting with the one on the server !";
  this.revId = revId;
  this.serverRevId = serverRevId;
};

util.inherits(RevisionConflictError, Error);

module.exports = exports = function revisionPlugin(schema, options) {
  
  schema.add({ 
    revision: {
      type: Number,
      default: 0,
      min: 0
    }
  });
  
  schema.pre('save', function (next) {
    var doc = this;
    var Model = doc.model(doc.constructor.modelName);
    if(doc.isNew) {
      doc.revision = 0
      return next();
    } else {
      Model.findById(doc._id, function(err, savedDoc) {
        if(err) {
          return next(err);
        }
        if(savedDoc.revision > doc.revision) {
          return next(
            new RevisionConflictError(doc.revision, savedDoc.revision)
          );
        } else {
          doc.revision++;
          return next();
        }
      });
    }
  });

}
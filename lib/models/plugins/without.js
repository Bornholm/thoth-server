module.exports = exports = function withoutPlugin(schema) {

  var slice = Array.prototype.slice;

  schema.methods.without = function() {
    var obj = this.toObject();
    var args = slice.call(arguments);
    args.forEach(function(field) {
      delete obj[field];
    });
    return obj;
  }
  
}
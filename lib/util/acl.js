var _ = require('lodash');

module.exports = function(thoth) {

  var helpers = {};

  helpers.getExistingSubjects = function() {
    var rbac = thoth.config.get('rbac');
    return _(rbac)
      .values()
      .flatten()
      .pluck('subject')
      .uniq()
      .map(function(category) {
        return category.split('.');
      })
      .value();
  };

  helpers.getAvailableSubjects = function() {
    var subjects = helpers.getExistingSubjects();
    subjects = subjects.map(function(subject) {
      var results = [];
      var i = subject.length;
      do {
        var sub = subject.slice(0, i);
        if(sub.length) {
          results.push(sub);
        }
      } while(i--);
      return results;
    });
    return _(subjects)
      .flatten(true)
      .uniq(function(sub) {
        return sub.toString();
      })
      .value();
  };

  return helpers;

};
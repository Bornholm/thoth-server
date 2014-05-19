(function(w) {

  "use strict";
  var angular = w.angular;
  var marked = w.marked;

  function MarkdownFilter($sce) {
    return function(value) {
      var html = marked(value || '');
      return $sce.trustAsHtml(html);
    }
  }

  MarkdownFilter.$inject = ['$sce'];

  angular.module('Thoth')
      .filter('markdown', MarkdownFilter);

}(window));
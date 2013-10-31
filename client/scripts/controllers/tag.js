(function(w) {

  "use strict";
  var angular = w.angular;
  var async = w.async;
  var _ = w._;

  var deps = [
    '$scope', '$routeParams',
    '$location', '$notifications',
    'lightRest'
  ];

  function TagCtrl($scope, $routeParams, $location, $notifs, $rest) {

    var action = $scope.action = $routeParams.action;
    var tagId = $routeParams.tagId;

    switch(action) {
      case 'new':
        $scope.record = {};
        startWatchingChange();
        break;
      case 'edit':
      case 'view':
        if(tagId) {
          $rest.get('/api/tags/:tagId', {tagId: tagId})
            .then(function(tag) {
              $scope.tag = tag;
            })
            .then(startWatchingChange);
        } else {
          $location.path('/tag/new');
        }
        break;
      default:
        $location.path('/tag/new');
    }

    var unwatch;
    function detectModification(newVal, oldVal) {
      if(oldVal !== newVal) {
        $scope.saveRequired = true;
      }
    };
    
    function startWatchingChange() {
      unwatch = $scope.$watch(
        'tag.label + tag.description',
        detectModification
      );
    }

    function saveHandler() {
        $notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
        $scope.saveRequired = false;
        startWatchingChange();
      }

    $scope.save = function() {
      var isNew = !('_id' in $scope.tag);
      if(typeof unwatch === 'function') {
        unwatch();
      }
      if(isNew) {
        $rest.post('/api/tags', $scope.tag).then(saveHandler);
      } else {
        $rest.put('/api/tags/:_id', $scope.tag).then(saveHandler);
      }
    }

  }

  TagCtrl.$inject = deps;

  angular.module('Thoth')
    .controller('TagCtrl', TagCtrl);

}(window))
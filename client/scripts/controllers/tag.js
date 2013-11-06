(function(w) {

  "use strict";
  var angular = w.angular;
  var async = w.async;
  var _ = w._;

  var deps = [
    '$scope', '$routeParams',
    '$location', '$notifications',
    'lightRest', '$timeout',
  ];

  function TagCtrl($scope, $routeParams, $location, $notifs, $rest, $timeout) {

    var action = $scope.action = $routeParams.action;
    var tagId = $routeParams.tagId;

    $scope.watchingExp = 'tag.label + tag.description';

    switch(action) {
      case 'new':
        $scope.tag = {};
        $timeout(function() {
          $scope.$broadcast('start-watching');
        }, 1000);
        break;
      case 'edit':
      case 'view':
        if(tagId) {
          $rest.get('/api/tags/:tagId', {tagId: tagId})
            .then(function(tag) {
              $scope.tag = tag;
              $scope.$broadcast('start-watching');
            });
        } else {
          $location.path('/tag/new');
        }
        break;
      default:
        $location.path('/tag/new');
    }

    function saveHandler() {
      $notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
      $scope.$broadcast('reset-watching');
    }

    $scope.save = function() {
      var isNew = !('_id' in $scope.tag);
      $scope.$broadcast('stop-watching');
      if(isNew) {
        $rest.post('/api/tags', $scope.tag).then(saveHandler);
      } else {
        $rest.put('/api/tags/:_id', $scope.tag).then(saveHandler);
      }
    };

    $scope.canDelete = function() {
      return $scope.tag && ('_id' in $scope.tag);
    };

  }

  TagCtrl.$inject = deps;

  angular.module('Thoth')
    .controller('TagCtrl', TagCtrl);

}(window))
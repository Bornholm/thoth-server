(function(w) {

  "use strict";
  var angular = w.angular;
  var async = w.async;
  var _ = w._;

  var deps = [
    '$scope',
    '$routeParams',
    '$location',
    '$notifications',
    'lightRest',
    '$timeout',
    '$translate'
  ];

  function RoleCtrl(
    $scope, $routeParams,
    $location, $notifs,
    $rest, $timeout,
    $translate
  ) {

    var action = $scope.action = $routeParams.action;
    var roleId = $routeParams.roleId;

    $scope.watchingExp = function() {
      return $scope.role.name + JSON.stringify($scope.recordsPermissions);
    };

    $scope.recordsPermissions = [];

    switch(action) {
      case 'new':
        $scope.role = {
          permissions: []
        };
        $timeout(function() {
          $scope.$broadcast('start-watching');
        }, 1000);
        break;
      case 'edit':
      case 'view':
        if(roleId) {
          $rest.get('/api/roles/:roleId', {roleId: roleId}).then(
            function(data) {
              $scope.role = data;
              updateRecordsPermissions();
              $scope.$broadcast('start-watching');
            }
          );
        } else {
          $location.path('/role/new');
        }
        break;
      default:
        $location.path('/role/new');
    }

    function queryAsTags(query) {
      var tags = [];
      if(query === '*') {
        tags.push('*');
      } else {
        var tagsFilter = query.tags;
        if(tagsFilter) {
          var $in = tagsFilter.$in || [];
          $in.forEach(function(v) {
            tags.push(v);
          });
          var $nin = tagsFilter.$nin || [];
          $nin.forEach(function(v) {
            tags.push('!'+v);
          });
        }
      }
      return tags;
    };

    function updateRecordsPermissions() {
      $scope.recordsPermissions = $scope.role.permissions.map(function(p) {
        return {
          op: p.op,
          tags: queryAsTags(p.q)
        };
      });
    };

    function saveHandler() {
      $notifs.add($translate('GLOBAL.SAVED'), '', $notifs.SUCCESS);
      $scope.$broadcast('reset-watching');
    }

    $scope.newPerm = {};
    $scope.addNewPermission = function() {
      var newPerm = $scope.newPerm;
      $scope.recordsPermissions.push(newPerm);
      $scope.newPerm = {};
    };

    $scope.removePermission = function(p) {
      var permissions = $scope.recordsPermissions;
      permissions.splice(permissions.indexOf(p), 1);
    };

    function saveRole(cb) {
      var isNew = !('_id' in $scope.role);
      $scope.$broadcast('stop-watching');
      var promise;
      if(isNew) {
        promise = $rest.post('/api/roles', $scope.role)
          .then(function(data) {
            $scope.role = data;
            return cb();
          });
      } else {
        promise = $rest.put('/api/roles/:_id', $scope.role);
      }
      promise.then(cb.bind(null, null), cb);
    }

    function saveRecordsPermissions(cb) {
      var permissions = _.reject($scope.recordsPermissions, function(p) {
        return p.op === '*';
      });
      var promise = $rest.put(
        '/api/roles/:roleId/permissions/records',
        permissions,
        {
          overwrite: {
            roleId: $scope.role._id
          }
        }
      );
      promise.then(cb.bind(null, null), cb);
    }

    $scope.save = function() {
      async.series([
        saveRole,
        saveRecordsPermissions
      ], saveHandler);
    }

    $scope.canDelete = function() {
      return '_id' in $scope.role;
    };

    $scope.availableOperations = [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE'
    ];

  }

  RoleCtrl.$inject = deps;

  angular.module('Thoth')
    .controller('RoleCtrl', RoleCtrl);

}(window))
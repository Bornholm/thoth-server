(function(w) {

  "use strict";
  var angular = w.angular;
  var async = w.async;
  var _ = w._;

  angular.module('Thoth')
    .controller('RoleCtrl', [
      '$scope', '$routeParams',
      '$location', '$notifications', 'lightRest',
      function(
        $scope, $routeParams,
        $location, $notifs, $rest
      ) {

      var action = $scope.action = $routeParams.action;
      var roleId = $routeParams.roleId;

      $scope.recordsPermissions = [];

      switch(action) {
        case 'new':
          $scope.role = {};
          $scope.role.permissions = [];
          startWatchingChange();
          break;
        case 'edit':
        case 'view':
          if(roleId) {
            $rest.get('/api/roles/:roleId', {roleId: roleId}).success(
              function(data) {
                $scope.role = data;
                updateRecordsPermissions();
                startWatchingChange();
              }
            );
          } else $location.path('/role/new');
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

      var unwatch;
      function detectModification(newVal, oldVal) {
        if(oldVal !== newVal) {
          $scope.saveRequired = true;
        }
      };
      
      function startWatchingChange() {
        unwatch = $scope.$watch(
          function() {
            return $scope.role.name + JSON.stringify($scope.recordsPermissions);
          },
          detectModification
        );
      }

      function saveHandler() {
        $notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
        $scope.saveRequired = false;
        startWatchingChange();
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
        if(typeof unwatch === 'function') {
          unwatch();
        }
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
        promise.success(cb.bind(null, null));
        promise.error(cb);
      }

      $scope.save = function() {
        async.series([
          saveRole,
          saveRecordsPermissions
        ], saveHandler);
      }

      $scope.availableOperations = [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE'
      ];

    }]);

}(window))
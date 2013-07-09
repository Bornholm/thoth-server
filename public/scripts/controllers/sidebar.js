(function(w) {
	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('SidebarCtrl', ['$scope', '$location', '$auth', function($scope, $location, $auth) {

			$scope.navState = {
				home: false,
				record: false,
				search: false,
				admin: false,
				profile: false,
				login: false
			}

			$scope.$location = $location

			$scope.$watch('$location.path()', function() {
				var path = $location.path();
				Object.keys($scope.navState).forEach(function(key) {
					var baseIndex = path.indexOf('/', 1);
					$scope.navState[key] = (path.slice(0, !~baseIndex ? path.length : baseIndex) === '/'+key);
				});
			});

			$scope.logout = $auth.logout.bind($auth);

	}]);

}(window))
(function(w) {
	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('SidebarCtrl', ['$scope', '$location', '$auth', function($scope, $location, $auth) {

			$scope.navState = {
				home: false,
				'new-record': false,
				search: false,
				admin: false,
				profile: false,
				login: false
			}

			$scope.$location = $location

			$scope.$watch('$location.path()', function() {
				var path = $location.path();
				Object.keys($scope.navState).forEach(function(key) {
					$scope.navState[key] = (path === '/'+key);
				});
			});

			$scope.logout = $auth.logout.bind($auth);

	}]);

}(window))
(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('LoginCtrl', ['$scope', '$auth', '$location', function($scope, $auth, $location) {

			$scope.tryLogin = function() {
				$auth.login($scope.username, $scope.password)
					.then(function() {
						$location.path('/home')
					});
			};

		}]);

}(window))
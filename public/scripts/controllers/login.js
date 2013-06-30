(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('LoginCtrl', ['$scope', '$auth', '$location', function($scope, $auth, $location) {

			$scope.tryLogin = function(username, password) {
				$auth.login(username, password)
					.then(function() {
						$location.path('/home')
					});
			};

			// Auto login 
			$auth.ping().then(function() {
				$location.path('/home')
			});

		}]);

}(window))
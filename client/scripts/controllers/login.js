(function(w) {

	"use strict";
	var angular = w.angular;

	var deps = [
		'$scope', '$auth', '$location', 
		'$notifications', '$translate'
	];

	function LoginCtrl($scope, $auth, $location, $notifs, $translate) {

		$scope.tryLogin = function(username, password) {
			$auth.login(username, password)
				.then(function(user) {
					if($scope.nextUrl) {
						$location.url($scope.nextUrl);
					} else {
						$location.path('/home');
					}
				}, $scope.serverErrorHandler);
		};

	}

	LoginCtrl.$inject = deps;

	angular.module('Thoth')
		.controller('LoginCtrl', LoginCtrl);

}(window))
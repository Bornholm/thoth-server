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
					$location.path('/home');
				});
		};

	}

	LoginCtrl.$inject = deps;

	angular.module('Thoth')
		.controller('LoginCtrl', LoginCtrl);

}(window))
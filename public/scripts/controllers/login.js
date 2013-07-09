(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('LoginCtrl', [
			'$scope', '$auth', '$location', 
			'$notifications',
			function(
				$scope, $auth, $location,
				$notifs
			) {

			$scope.tryLogin = function(username, password) {
				$auth.login(username, password)
					.then(function() {
						$location.path('/home')
					}, function(err) {
						if(err.status === 401) {
							$notifs.add('Erreur', 'Identifiant ou mot de passe invalide.', $notifs.WARNING);
						} else {
							$notifs.add('Erreur', "Erreur applicative. Contactez l'administrateur.", $notifs.ERROR);
						}
					});
			};

			// Auto login 
			$auth.ping().then(function() {
				$location.path('/home')
			});

		}]);

}(window))
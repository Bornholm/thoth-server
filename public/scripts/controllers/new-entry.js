(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('NewEntryCtrl', ['$scope', function($scope) {

			$scope.newEntry = {
				label: "Webpublic",
				type: "Serveur",

				credentials: [
					{label: 'Compte Root', user: 'root', password: 'qsd25sdf<w'},
					{label: 'User 1', user: 'user1', password: 'dgfhdf54ws'}
				]

			};

		}]);

}(window))
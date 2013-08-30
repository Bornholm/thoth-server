(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', '$api',
      '$location',
			function($scope, $api, $location) {
        var search = $location.search();
				$scope.records = $api.Record.query(search);
		  }
    ]);

}(window))
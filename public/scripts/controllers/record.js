(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('RecordCtrl', [
			'$scope', 'Restangular', '$routeParams',
			'$location', '$notifications',
			function(
				$scope, R, $routeParams,
				$location, $notifs
			) {

			var action = $scope.action = $routeParams.action;
			var recordId = $routeParams.recordId;
			switch(action) {
				case 'new':
					$scope.record = {};
					break;
				case 'edit':
				case 'view':
					if(recordId) {
						R.one('records', recordId)
							.get()
							.then(function(data) {
								$scope.record = data;
							});
					} else $location.path('/record/new');
					break;
				default:
					$location.path('/record/new');
			}

			$scope.save = function() {
				var isNew = !$scope.record._id;

				function saveHandler() {
					$notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
					$scope.record = {};
				}

				if(isNew) {
					R.all('records')
						.post($scope.record)
						.then(saveHandler);
				} else {
					R.one('records', $scope.record._id)
				}
				
			}

			$scope.availableTags = [
				'Webpublic',
				'Machine',
				'Root'
			];

		}]);

}(window))
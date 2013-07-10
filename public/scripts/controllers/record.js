(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('RecordCtrl', [
			'$scope', '$api', '$routeParams',
			'$location', '$notifications',
			function(
				$scope, $api, $routeParams,
				$location, $notifs
			) {

			var action = $scope.action = $routeParams.action;
			var recordId = $routeParams.recordId;
			switch(action) {
				case 'new':
					$scope.record = new $api.Record();
					break;
				case 'edit':
				case 'view':
					if(recordId) {
						$api.Record.get({id: recordId}, function(r) {
							$scope.record = r;
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
				}

				if(isNew) {
					$scope.record.$save(saveHandler);
				} else {
					$scope.record.$update(saveHandler);
				}
				
			}

			$scope.availableTags = [
				'Webpublic',
				'Machine',
				'Root'
			];

		}]);

}(window))
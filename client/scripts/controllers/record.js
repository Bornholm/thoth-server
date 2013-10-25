(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('RecordCtrl', [
			'$scope', 'lightRest', '$routeParams',
			'$location', '$notifications',
			function(
				$scope, $rest, $routeParams,
				$location, $notifs
			) {

			var action = $scope.action = $routeParams.action;
			var recordId = $routeParams.recordId;

			switch(action) {
				case 'new':
					$scope.record = {};
					startWatchingChange();
					break;
				case 'edit':
				case 'view':
					if(recordId) {
						$rest.get('/api/records/:recordId', {recordId: recordId})
							.then(function(res) {
								$scope.record = res.data;
							})
							.then(startWatchingChange);
					} else {
						$location.path('/record/new');
					}
					break;
				default:
					$location.path('/record/new');
			}

			var unwatch;
			function detectModification(newVal, oldVal) {
				if(oldVal !== newVal) {
					$scope.saveRequired = true;
				}
			};
			
			function startWatchingChange() {
				unwatch = $scope.$watch(
					'record.label + record.tags + record.text',
					detectModification
				);
			}

			function saveHandler() {
				$notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
				$scope.saveRequired = false;
				startWatchingChange();
			}

			$scope.save = function() {
				var isNew = !('_id' in $scope.record);
				if(typeof unwatch === 'function') {
					unwatch();
				}
				if(isNew) {
					$rest.post('/api/records', $scope.record).then(saveHandler);
				} else {
					$rest.put('/api/records/:_id', $scope.record).then(saveHandler);
				}
			}

			$scope.availableTags = [
				'Webpublic',
				'Machine',
				'Root'
			];

		}]);

}(window))
(function(w) {

	"use strict";
	var angular = w.angular;

	var deps = [
		'$scope', 'lightRest',
		'$routeParams', '$location',
		'$notifications', '$translate',
		'$timeout'
	];

	function RecordCtrl(
		$scope, $rest,
		$routeParams, $location,
		$notifs, $translate,
		$timeout
	) {

		$scope.viewMode = true;

		var action = $scope.action = $routeParams.action;
		var recordId = $routeParams.recordId;

		$scope.watchingExp = 'record.label + record.tags + record.text + record.category';

		switch(action) {
			case 'new':
				$scope.record = {};
				$scope.record.text="### IP\n\n### SSH\n- Identifiant :\n- Mot de passe :";
				$timeout(function() {
					$scope.$broadcast('start-watching');
				}, 1000);
				$scope.viewMode = false;
				break;
			case 'edit':
				$scope.viewMode = false;
			case 'view':
				if(recordId) {
					$rest.get('/records/:recordId', {recordId: recordId})
						.then(function(record) {
							$scope.record = record;
							$scope.$broadcast('start-watching');
						});
				} else {
					$location.path('/record/new');
				}
				break;
			default:
				$location.path('/record/new');
		}

		var op = action === 'new' ? 'CREATE' : 'UPDATE';
		$rest
			.get('/records/categories', null, {params: {op: op}})
			.then(function(categories) {
				$scope.categories = categories;
			});
		
		function saveHandler(record) {
			$notifs.add('GLOBAL.SAVED', '', $notifs.SUCCESS);
			$scope.record = record;
			$scope.$broadcast('reset-watching');
		}

		function deleteHandler() {
			$notifs.add('GLOBAL.DELETED', '', $notifs.SUCCESS);
			$location.path('/home');
		}

		function reload() {
			$location.path('/record/' + $scope.record._id + '/edit');
		};

		$scope.save = function() {
			var isNew = !('_id' in $scope.record);
			$scope.$broadcast('stop-watching');
			if(isNew) {
				$rest.post('/records', $scope.record)
					.then(saveHandler, $scope.serverErrorHandler)
					.then(reload);
			} else {
				$rest.put('/records/:_id', $scope.record)
					.then(saveHandler, $scope.serverErrorHandler);
			}
		};

		$scope.delete = function() {
			var validateDelete = w.confirm($translate('RECORD_PAGE.DELETE_CONFIRM'));
			if(validateDelete) {
				$rest.delete('/records/:_id', $scope.record)
					.then(deleteHandler, $scope.serverErrorHandler);
			}
		};

		$scope.canDelete = function() {
      return ('_id' in $scope.record);
    };

	}

	RecordCtrl.$inject = deps;

	angular.module('Thoth')
		.controller('RecordCtrl', RecordCtrl);

}(window))

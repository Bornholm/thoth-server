(function(w) {

	"use strict";
	var angular = w.angular;
	var $ = w.$;

	var dataListId = 0;

	function onTagChange(evt) {
		var $scope = this;
		$scope.$apply(function() {
			var input = $(evt.target);
			var tag = input.val();
			switch(evt.keyCode) {
				case 188: // key == ','  || key == 'Enter'
				case 13:
					if(tag.length > 1) {
						if($scope.label) {
							var label = evt.keyCode === 188 ? tag.slice(0, -1) : tag;
							tag = {};
							tag[$scope.label] = label;
							$scope.tags.push(tag);
						} else {
							$scope.tags.push(evt.keyCode === 188 ? tag.slice(0, -1) : tag);
						}
					}
					input.val('');
				break;
				case 8: // key == 'Return'
					if(tag.length === 0 && $scope.tags.length) {
						tag = $scope.tags[$scope.tags.length-1];
						$scope.tags.pop();
						input.val($scope.label ? tag[$scope.label] : tag);
					}
				break;
			}
		});
	};

	angular.module('Thoth')
		.directive('tagInput', [function factory() {
			return {
				restrict: 'E',
				require: 'ngModel',
				scope: {
					tags: '=ngModel',
					dataList: '=tagsAvailable',
					label: '=tagsLabel'
				},
				template: 
					'<table>' +
					'<tbody>' +
					'<tr>' +
					'<td>' +
					'<div class="label label-default" ng-repeat="t in tags"><span>{{getTagLabel(t)}}</span> '+
					'<button class="close" ng-mousedown="removeTag(t)">&times;</button>' + 
					'</div>' +
					'</td>' +
					'<td class="real-input">' +
					'<input type="text" ng-model="tagsText" list="datalist-tag-input-' + dataListId + '" />' +
					'<datalist id="datalist-tag-input-' + dataListId++ + '">' +
					'<option ng-repeat="item in dataList" value="{{getTagLabel(t)}}" />' +
					'</datalist>' +
					'</td>' +
					'</tr>' +
					'</tbody>' +
					'</tbody>',
				link: function(scope, iElement) {
					var input = $(iElement).find('input');
					input.keyup(onTagChange.bind(scope));
				},

				controller: ['$scope', function($scope) {
					$scope.tags = $scope.tags || [];
					$scope.removeTag = function(tag) {
						$scope.tags.splice($scope.tags.indexOf(tag), 1);
					}
					$scope.getTagLabel = function(tag) {
						return $scope.label ? tag[$scope.label] : tag;
					}
				}]

			}
		}]);

}(window))
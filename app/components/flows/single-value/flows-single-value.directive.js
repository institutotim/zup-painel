'use strict';

angular
  .module('FlowsSingleValueComponentModule', [])

  .directive('flowsSingleValue', function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $scope.editValue = angular.copy($scope.value);
        $scope.index = $parse($attrs.flowsSingleValue)($scope);

        $scope.saveValue = function () {
          $scope.editingValue = false;
          $scope.$parent.field.values[$scope.index] = $scope.editValue;
          $scope.$parent.saveField();
        };

        $scope.removeValue = function () {
          if ($scope.$parent.field.values.length > 1) {
            $scope.$parent.field.values.splice($scope.index, 1);
            $scope.$parent.saveField();
          }
        };
      }
    };
  });

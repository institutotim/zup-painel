'use strict';

angular
  .module('AdvancedFiltersAreaModalControllerModule', [
    'AreaMapComponentModule',
    'AddAreaCircleFormComponentModule',
    'ReplaceDotWithCommaHelperModule'
  ])
  .controller('AdvancedFiltersAreaModalController', function($scope, $modalInstance, activeAdvancedFilters) {
    $scope.activeAdvancedFilters = activeAdvancedFilters;

    $scope.save = function() {
      for (var i = $scope.circles.length - 1; i >= 0; i--) {
        var beginDateFilter = {
          title: 'Perímetro',
          type: 'area',
          desc: $scope.circles[i].get('distance').toFixed(2).replace('.', ',') + 'km de ' + $scope.circles[i].get('position').lat().toFixed(4) + ', ' + $scope.circles[i].get('position').lng().toFixed(4),
          value: {latitude: $scope.circles[i].get('position').lat(), longitude: $scope.circles[i].get('position').lng(), distance: $scope.circles[i].get('distance') * 1000} // we convert the distance to meters, as used in the API
        };

        $scope.activeAdvancedFilters.push(beginDateFilter);
      }

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

'use strict';

angular
  .module('AdvancedFiltersAreaModalControllerModule', [
    'AreaMapComponentModule',
    'AddAreaCircleFormComponentModule',
    'ReplaceDotWithCommaHelperModule'
  ])
  .controller('AdvancedFiltersAreaModalController', function ($scope, $modalInstance, $timeout, activeAdvancedFilters, currentFilter) {
    $scope.activeAdvancedFilters = activeAdvancedFilters;
    $scope.currentFilter = currentFilter;

    $scope.save = function () {
      if (currentFilter) {
        var circle = $scope.circles[0];
        currentFilter.desc = circle.get('distance').toFixed(2).replace('.', ',') + 'km de ' + circle.get('position').lat().toFixed(4) + ', ' + circle.get('position').lng().toFixed(4);
        currentFilter.value = {latitude: circle.get('position').lat(), longitude: circle.get('position').lng(), distance: circle.get('distance') * 1000}; // we convert the distance to meters, as used in the API
      } else {
        for (var i = $scope.circles.length - 1; i >= 0; i--) {
          var areaFilter = {
            title: 'Perímetro',
            type: 'area',
            desc: $scope.circles[i].get('distance').toFixed(2).replace('.', ',') + 'km de ' + $scope.circles[i].get('position').lat().toFixed(4) + ', ' + $scope.circles[i].get('position').lng().toFixed(4),
            value: {latitude: $scope.circles[i].get('position').lat(), longitude: $scope.circles[i].get('position').lng(), distance: $scope.circles[i].get('distance') * 1000} // we convert the distance to meters, as used in the API
          };

          $scope.activeAdvancedFilters.push(areaFilter);
        }
      }

      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.close();
    };

    $modalInstance.opened.then(function () {
      if (currentFilter) {
        _waitForMap();
      }
    });

    var _waitForMap = function () {
      if ($scope.mapProvider && $scope.fitCirclesBounds) {
        $scope.mapProvider.addCircle(new google.maps.LatLng(currentFilter.value.latitude, currentFilter.value.longitude));
        $scope.mapProvider.circles[0].set('distance', currentFilter.value.distance);
        $scope.fitCirclesBounds();
      } else {
        $timeout(_waitForMap, 500);
      }
    };
  });

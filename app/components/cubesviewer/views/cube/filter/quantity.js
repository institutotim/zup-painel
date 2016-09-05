"use strict";

angular.module('cv.views.cube').controller("CubesViewerViewsCubeFilterQuantityController", ['$rootScope', '$scope', '$filter', 'cvOptions', 'cubesService', 'viewsService',
  function ($rootScope, $scope) {
    $scope.quantity_filter = {
      order: 'top'
    };

    $scope.applyFilter = function(){
      var amount = parseInt($scope.quantity_filter.amount, 10);
      if(!isNaN(amount)) {
        $scope.view.params.quantity_filter = $scope.quantity_filter;
      }

      $scope.closeQuantityFilter();
      $scope.refreshView();
    };

    $scope.closeQuantityFilter = function(){
      $scope.view.quantity_filter_open = false;
    }
  }]);



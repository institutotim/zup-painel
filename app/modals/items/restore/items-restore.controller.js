'use strict';

angular
  .module('ItemsRestoreModalControllerModule', [])

  .controller('ItemsRestoreModalController', function($scope, $modalInstance, setItemData, clearData) {
    $scope.restore = function() {
      setItemData();

      $modalInstance.close();
    };

    $scope.close = function() {
      clearData();
      $modalInstance.close();
    };
  });

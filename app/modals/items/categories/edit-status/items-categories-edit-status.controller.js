'use strict';

angular
  .module('ItemsCategoriesEditStatusModalControllerModule', [])

  .controller('ItemsCategoriesEditStatusModalController', function($scope, Restangular, $modalInstance, status, updating, categoryId) {
    $scope.status = angular.copy(status);

    $scope.save = function() {
      if (updating)
      {
        var updateStatusPromise = Restangular.one('inventory').one('categories', categoryId).one('statuses', status.id).customPUT($scope.status);

        updateStatusPromise.then(function() {
          status.title = $scope.status.title;
          status.color = $scope.status.color;

          $modalInstance.close();
        });
      }
      else
      {
        status.title = $scope.status.title;
        status.color = $scope.status.color;

        $modalInstance.close();
      }
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

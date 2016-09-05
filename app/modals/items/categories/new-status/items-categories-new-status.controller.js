'use strict';

angular
  .module('ItemsCategoriesNewStatusModalControllerModule', [])

  .controller('ItemsCategoriesNewStatusModalController', function($scope, Restangular, $modalInstance, statuses, updating, categoryId) {
    $scope.status = {color: '#2FB4E6'};

    $scope.save = function() {
      if (updating)
      {
        var newStatusPromise = Restangular.one('inventory').one('categories', categoryId).post('statuses', {title: $scope.status.title, color: $scope.status.color});

        newStatusPromise.then(function(response) {
          statuses.push(Restangular.stripRestangular(response.data));

          $modalInstance.close();
        });
      }
      else
      {
        statuses.push({title: $scope.status.title, color: $scope.status.color});

        $modalInstance.close();
      }
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

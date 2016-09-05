'use strict';

angular
  .module('ItemsDestroyModalControllerModule', ['InventoriesItemsServiceModule'])
  .controller('ItemsDestroyModalController', function($scope, Restangular, InventoriesItemsService, $modalInstance, item, category) {
    $scope.item = item;

    // delete user from server
    $scope.confirm = function() {
      var deletePromise = InventoriesItemsService.remove($scope.item.id, category.id);

      deletePromise.then(function() {
        $modalInstance.close();
        $scope.showMessage('ok', 'O item de inventário ' + $scope.item.title + ' foi removido com sucesso', 'success', true);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

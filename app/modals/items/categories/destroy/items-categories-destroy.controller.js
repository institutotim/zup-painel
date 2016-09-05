'use strict';

angular
  .module('ItemsCategoriesDestroyModalControllerModule', [
    'InventoriesCategoriesServiceModule'
  ])
  .controller('ItemsCategoriesDestroyModalController', function(Restangular, $scope, $modalInstance, inventoriesCategoriesList, category, $cookies, InventoriesCategoriesService) {
    $scope.category = category;

    // delete user from server
    $scope.confirm = function() {
      $scope.deletePromise = Restangular.one('inventory').one('categories', $scope.category.id).remove();

      $scope.deletePromise.then(function() {
        delete $cookies.inventoryFiltersHash; // we need to remove the saved filters because the user might have selected the category

        // remove user from list
        inventoriesCategoriesList.splice(inventoriesCategoriesList.indexOf($scope.category), 1);

        $scope.showMessage('ok', 'A categoria de inventário foi removida com sucesso.', 'success', true);

        InventoriesCategoriesService.purgeCache();

        $modalInstance.close();
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

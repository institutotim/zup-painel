'use strict';

angular
  .module('ItemsCategoriesDeletedControllerModule', [
    'ItemsCategoriesDestroyModalControllerModule',
    'InventoriesCategoriesServiceModule'
  ])

  .controller('ItemsCategoriesDeletedController', function ($scope, InventoriesCategoriesService, $modal, $state) {
    console.log('entrou');
    $scope.loading = true;

    InventoriesCategoriesService.fetchAllDeleted().then(function(response) {
      $scope.categories = response.data.categories;
      $scope.loading = false;
    });

    $scope.restoreCategory = function (category) {
      InventoriesCategoriesService.restoreCategory(category).then(function(response) {
        $state.go('items.categories');
        $scope.showMessage('ok', 'A categoria de inventário foi restaurada com sucesso', 'success', true);
      });
    };
  });

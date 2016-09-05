'use strict';

angular
  .module('ReportsCategoriesDestroyModalControllerModule', [
    'ReportsCategoriesServiceModule'
  ])

  .controller('ReportsCategoriesDestroyModalController', function($scope, $modalInstance, Restangular, destroyCategory, category, ReportsCategoriesService) {
    $scope.category = category;

    // delete user from server
    $scope.confirm = function() {
      $scope.deleting = true;
      var deletePromise = Restangular.one('reports').one('categories', $scope.category.id).remove();

      deletePromise.then(function() {
        ReportsCategoriesService.purgeCache();

        $scope.deleting = false;
        $modalInstance.close();

        $scope.showMessage('ok', 'A categoria de relato foi removida com sucesso', 'success', true);

        // remove user from list
        destroyCategory($scope.category);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

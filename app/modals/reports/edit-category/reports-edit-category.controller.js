'use strict';

angular
  .module('ReportsEditCategoryModalControllerModule', ['SelectListComponentModule'])
  .controller('ReportsEditCategoryModalController', function(Restangular, $scope, $modalInstance, category, report, categories, $rootScope, $state) {
    $scope.categories = categories.data;

    $rootScope.resolvingRequest = false;
    $scope.report = angular.copy(report);
    $scope.category = category;

    $scope.transfer = { toCategory: null, toStatus: null };

    // category select functions
    $scope.subCategories = function(item) {
      if (item.parent_id == null)
      {
        return 'Categorias principais';
      }

      if (item.parent_id !== null)
      {
        return 'Subcategorias';
      }
    };



    $scope.$on('optionSelected', function(e, category){
      e.stopPropagation();
      $scope.categoryData = category;
      var statusesPromise = Restangular.one('reports').one('categories', category.id).all('statuses').getList({
        return_fields: 'id,color,title,flow'
      });
      statusesPromise.then(function(response){
        $scope.categoryData.statuses = response.data;
      });
    });

    $scope.confirm = function() {
      $modalInstance.close();
      $rootScope.resolvingRequest = true;

      var changeCategoryPromise = Restangular.one('reports', $scope.category.id).one('items', $scope.report.id).customPUT({
        'new_category_id': $scope.transfer.toCategory, 'new_status_id': $scope.transfer.toStatus.id,
        return_fields: ''
      }, 'change_category'); // jshint ignore:line

      changeCategoryPromise.then(function() {
        $scope.showMessage('ok', 'A categoria do relato foi alterada com sucesso!', 'success', true);

        // refresh page because we change crucial information about our report
        $state.go($state.current, {}, {reload: true});
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

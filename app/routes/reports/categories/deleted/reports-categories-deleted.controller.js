'use strict';

angular
  .module('ReportsCategoriesDeletedControllerModule', [
    'ReportsCategoriesDestroyModalControllerModule',
    'ReportsCategoriesServiceModule'
  ])

  .controller('ReportsCategoriesDeletedController', function ($scope, ReportsCategoriesService, $modal, $state) {
    $scope.loading = true;

    var populateCategories = function(categories) {
      categories = angular.copy(categories);

      _.each(categories, function (category) {
        if (category.parent_id !== null) {
          var parentIndex = categories.indexOf(_.findWhere(categories, { id: category.parent_id }));

          if (parentIndex === -1) {
            return false;
          }

          var ownIndex = categories.indexOf(category);

          if (_.isUndefined(categories[parentIndex].subcategories)) {
            categories[parentIndex].subcategories = [category];
          } else {
            categories[parentIndex].subcategories.push(category);
          }

          categories[ownIndex] = undefined;
        }

        // since we defined every subcategory as undefined, let's clean it up :)
        categories = _.without(categories, undefined);
        $scope.categories = categories;
      });

      $scope.loading = false;
    };

    ReportsCategoriesService.fetchAllDeleted().then(function(response) {
      populateCategories(response.data.categories);
    });

    $scope.restoreCategory = function (category) {
      ReportsCategoriesService.restoreCategory(category).then(function(response) {
        $state.go('reports.categories');
        $scope.showMessage('ok', 'A categoria de relato foi restaurada com sucesso', 'success', true);
      });
    };
  });

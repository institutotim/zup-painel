'use strict';

angular
  .module('ReportsCategoriesIndexControllerModule', [
    'ReportsCategoriesDestroyModalControllerModule',
    'ReportsCategoriesServiceModule'
  ])

  .controller('ReportsCategoriesIndexController', function ($scope, ReportsCategoriesService, $modal) {
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

    ReportsCategoriesService.fetchAllBasicInfo().then(function(response) {
      populateCategories(response.data.categories);
    });

    $scope.iconSeed = Math.random().toString(36).substring(7);

    $scope.deleteCategory = function (category) {
      $modal.open({
        templateUrl: 'modals/reports/categories/destroy/reports-categories-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          destroyCategory: function(){
            return function(category) {
              if(_.isNull(category.parent_id)) {
                $scope.categories.splice($scope.categories.indexOf(category), 1);
              } else {
                var subcategories = _.findWhere($scope.categories, { id: category.parent_id }).subcategories;
                subcategories.splice(subcategories.indexOf(category), 1);
              }
            }
          },
          category: function() {
            return category;
          }
        },
        controller: 'ReportsCategoriesDestroyModalController'
      });
    };
  });

'use strict';

angular
  .module('AdvancedFiltersCategoryModalControllerModule', [])
  .controller('AdvancedFiltersCategoryModalController', function($scope, $rootScope, $modalInstance, activeAdvancedFilters, categoriesResponse, entityType) {

    $scope.entityType = entityType; // 'items' or 'reports'
    $rootScope.resolvingRequest = false;
    $scope.categories = [];
    $scope.activeAdvancedFilters = activeAdvancedFilters;
    var selectedCategoriesIDs = [];

    var categories = typeof categoriesResponse.data !== 'undefined' ? categoriesResponse.data : categoriesResponse;

    if(categories.categories) {
      categories = categories.categories;
    }

    var categoriesWithSubcategories = angular.copy(categories);

    _.each(categoriesWithSubcategories, function(category) {
      if (category.parent_id !== null)
      {
        var parentIndex = categoriesWithSubcategories.indexOf(_.findWhere(categoriesWithSubcategories, { id: category.parent_id }));

        if (parentIndex === -1) return false;

        var ownIndex = categoriesWithSubcategories.indexOf(category);

        if (_.isUndefined(categoriesWithSubcategories[parentIndex].subcategories))
        {
          categoriesWithSubcategories[parentIndex].subcategories = [category];
        }
        else
        {
          categoriesWithSubcategories[parentIndex].subcategories.push(category);
        }

        categoriesWithSubcategories[ownIndex] = undefined;
      }
    });

    // since we defined every subcategory as undefined, let's clean it up :)
    categoriesWithSubcategories = _.without(categoriesWithSubcategories, undefined);

    $scope.categories = categoriesWithSubcategories;

    _.each($scope.activeAdvancedFilters, function(filter) {
      if(filter.type == 'categories' && selectedCategoriesIDs.indexOf(filter.value) === -1)
      {
        selectedCategoriesIDs.push(filter.value);
      }
    });

    $scope.isActive = function(category) {
      return selectedCategoriesIDs.indexOf(category.id) !== -1;
    };

    $scope.updateCategory = function(category) {
      var index = selectedCategoriesIDs.indexOf(category.id);

      if (index === -1)
      {
        selectedCategoriesIDs.push(category.id);
      }
      else
      {
        selectedCategoriesIDs.splice(index, 1);
      }
    };

    $scope.save = function() {
      _.each(selectedCategoriesIDs, function(ID){
        var category = _.where(categories, { 'id': ID })[0];

        if(!_.any($scope.activeAdvancedFilters, function(filter) { return filter.type == 'categories' && filter.value == category.id; })) {
          var filter = {
            title: 'Categoria',
            type: 'categories',
            desc: category.title,
            value: category.id
          };

          $scope.activeAdvancedFilters.push(filter);
        }
      });

      _.each($scope.activeAdvancedFilters, function(filter, index) {
        if(filter && filter.type == 'categories' && selectedCategoriesIDs.indexOf(filter.value) === -1)
        {
          $scope.activeAdvancedFilters.splice(index, 1);
        }
      });

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

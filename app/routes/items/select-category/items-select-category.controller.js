'use strict';

angular
  .module('ItemsSelectCategoryControllerModule', [])

  .controller('ItemsSelectCategoryController', function ($scope, categoriesResponse) {
    $scope.categories = categoriesResponse;
  });

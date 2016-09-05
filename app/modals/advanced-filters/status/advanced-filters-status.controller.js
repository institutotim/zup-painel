'use strict';

angular
  .module('AdvancedFiltersStatusModalControllerModule', [
    'SlideComponent'
  ])

  .controller('AdvancedFiltersStatusModalController', function($scope, $rootScope, $modalInstance, activeAdvancedFilters, categoriesResponse, entityType) {
    $rootScope.resolvingRequest = false;

    // TODO Simplify this when inventory categories get its own API Client service
    var categories = typeof categoriesResponse.data !== 'undefined' ? categoriesResponse.data : categoriesResponse;

    $scope.entityType = entityType; // 'items' or 'reports'
    $scope.statuses = [];
    $scope.categories = [];
    $scope.search = {};

    var addStatusesFromCategory = function (category) {
      _.each(category.statuses, function (status) {
        var found = _.findWhere($scope.statuses, { id: status.id });

        if (_.isUndefined(found)) {
          $scope.statuses.push(status);
        }
      })
    };

    if(categories.categories) {
      categories = categories.categories;
    }

    _.each(categories, function (category) {
      $scope.categories.push(category);
      addStatusesFromCategory(category);

      _.each(category.subcategories, function (category) {
        $scope.categories.push(category);
        addStatusFromCategory(category);
      });
    });

    $scope.updateStatus = function(status) {
      if (typeof status.selected === 'undefined' || status.selected === false) {
        status.selected = true;
      }
      else {
        status.selected = false;
      }
    };

    $scope.save = function() {
      var statuses = {}, selectedCategories = [];

      for (var i = $scope.categories.length - 1; i >= 0; i--) {
        for (var j = $scope.categories[i].statuses.length - 1; j >= 0; j--) {
          if ($scope.categories[i].statuses[j].selected === true) {
            statuses[$scope.categories[i].statuses[j].id] = $scope.categories[i].statuses[j];
            if(selectedCategories.indexOf($scope.categories[i]) === -1) {
              selectedCategories.push($scope.categories[i]);
            }
          }

          $scope.categories[i].statuses[j].selected = false;
        };
      }

      for (var x in statuses) {
        var filter = {
          title: 'Estado',
          type: 'statuses',
          desc: statuses[x].title,
          value: statuses[x].id
        };

        activeAdvancedFilters.push(filter);
      }

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

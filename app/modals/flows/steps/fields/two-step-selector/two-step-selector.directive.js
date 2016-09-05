'use strict';

angular
  .module('TwoStepSelectorModule', ['FocusIfComponentModule'])
  .controller('TwoStepSelectorController', function ($rootScope, $modal, $scope, Restangular, $modalInstance, multiple, promise, selection, title, categoriesLabel, categoriesPromise, itemsLabel, itemsPromiseGenerator) {
    $scope.title = title;
    $scope.categoriesLabel = categoriesLabel;
    $scope.itemsLabel = itemsLabel;

    // Fills the first column with the categories
    $scope.loadingCategories = true;
    categoriesPromise.promise.then(function (categories) {
      $scope.categories = categories || [];
      $scope.loadingCategories = false;

      // Loads the items of the first selected category when the modal opens and toggles the selected items
      if (selection && !_.isEmpty(selection)) {
        var firstCategoryID = _.keys(selection)[0];
        var category = _.findWhere(categories, { id: parseInt(firstCategoryID, 10) });
        var previousSelections = angular.copy(selection[firstCategoryID]);

        $scope.selectCategory(category).then(function(){
          _.each(previousSelections, function (selectedItemID) {
            var selectedItem = _.findWhere($scope.items, { id: selectedItemID});
            $scope.toggleItem(category, selectedItem);
          });
        });
      } else {
        selection = {};
      }
    }, function () {
      $scope.fetchCategoriesFailure = true;
      $scope.loadingCategories = false;
    });

    $scope.selectCategory = function (category) {
      $scope.selectedCategory = category;
      _.each(selection, function (items, id) {
        if (items.length < 1) {
          delete selection[id];
        }
      });

      if (!multiple) {
        selection = {};
      }

      if (!selection[category.id]) {
        selection[category.id] = [];
      }

      $scope.loadingItems = true;
      return itemsPromiseGenerator.call(null, category).then(function (items) {
        $scope.items = items || [];
        $scope.loadingItems = false;
      }, function () {
        $scope.fetchItemsFailure = true;
        $scope.loadingItems = false;
      });
    };

    $scope.toggleItem = function (category, item) {
      if (!multiple) {
        selection[category.id] = [item];
        return;
      }

      if (!selection[category.id]) {
        selection[category.id] = [];
      }

      var itemIndex = selection[category.id].indexOf(_.findWhere(selection[category.id], {id: item.id}));
      if (itemIndex === -1) {
        selection[category.id].push(item);
      } else {
        selection[category.id].splice(itemIndex, 1);
      }
    };

    $scope.categorySelected = function (category) {
      return _.has(selection, category.id);
    };

    $scope.itemSelected = function (category, item) {
      if (!$scope.categorySelected(category)) {
        return false;
      }
      return _.findWhere(selection[category.id], {id: item.id});
    };

    $scope.valid = function () {
      return _.any(_.select(selection, function (items) {
        return items.length > 0;
      }));
    };

    $scope.confirm = function () {
      promise.resolve(selection);
      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.close();
      promise.reject();
    };
  })
  .factory('TwoStepSelector', function ($modal, $q) {
    return {
      /**
       * Opens the two-step selection modal
       * @param selection a previously persisted return from this service
       * @param title
       * @param categoriesLabel
       * @param categoriesPromise - must return an array of objects containing the properties id and title
       * @param itemsLabel
       * @param itemsPromiseGenerator - must accept one parameter: the ID of the selected category and return a promise
       * that returns an array of objects containing an ID and title
       * @returns if not canceled, returns a promise that returns an object where the keys are the IDs of categories
       * that has at least one item selected and the value is an array of IDs of those items
       */
      open: function (selection, title, multiple, categoriesLabel, categoriesPromise, itemsLabel, itemsPromiseGenerator) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/flows/steps/fields/two-step-selector/two-step-selector.template.html',
          windowClass: 'twoStepSelectorModal',
          resolve: {
            selection: function () {
              return selection;
            },
            title: function () {
              return title;
            },
            categoriesLabel: function () {
              return categoriesLabel;
            },
            categoriesPromise: function () {
              return {promise: categoriesPromise};
            },
            itemsLabel: function () {
              return itemsLabel;
            },
            itemsPromiseGenerator: function () {
              return itemsPromiseGenerator;
            },
            promise: function () {
              return deferred;
            },
            multiple: function () {
              return !!multiple;
            }
          },
          controller: 'TwoStepSelectorController'
        });

        return deferred.promise;
      }
    }
  });

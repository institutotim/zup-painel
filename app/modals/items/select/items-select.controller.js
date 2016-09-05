'use strict';

angular
  .module('ItemsSelectModalModule', [
    'InventoriesItemsServiceModule'
  ])
  .controller('ItemsSelectModalController', function ($scope, InventoriesItemsService, $modalInstance, insertedItems, permittedCategories, multiple) {
    var page = 1, per_page = 35;

    function initialize() {
      $scope.loadingPagination = false;
      $scope.items = [];
      $scope.insertedItems = angular.copy(insertedItems);

      $scope.getItems();
    }

    $scope.getItems = function (query) {
      var fetchOptions = {
        page: page,
        per_page: per_page,
        inventory_categories_ids: permittedCategories.join()
      };

      if (query) {
        fetchOptions['query'] = query;
      }

      $scope.loadingPagination = true;

      InventoriesItemsService
        .fetchAll(fetchOptions)
        .then(function (items) {
          $scope.loadingPagination = false;
          $scope.items = _.toArray(items);
        });
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.confirm = function () {
      $modalInstance.close($scope.insertedItems);
    };

    $scope.insertItem = function (item) {
      if (multiple) {
        $scope.insertedItems.push(item);
      } else {
        $scope.insertedItems[0] = item;
      }
    };

    $scope.removeItem = function (item) {
      $scope.insertedItems.splice($scope.insertedItems.indexOf(item), 1);
    };

    $scope.isInsertedItems = function (item) {
      return _.contains($scope.insertedItems, item);
    };

    initialize();
  })
  .factory('ItemsSelectModalService', function ($modal) {
    return {
      open: function (items, categories, multiple) {
        return (
          $modal.open({
            templateUrl: 'modals/items/select/items-select.template.html',
            windowClass: 'itemsSelectModal',
            resolve: {
              insertedItems: function () {
                return items;
              },
              permittedCategories: function () {
                return categories;
              },
              multiple: function () {
                return multiple;
              }
            },
            controller: 'ItemsSelectModalController',
            controllerAs: 'itemsSelectModalCtrl'
          }).result
        );
      }
    }
  });

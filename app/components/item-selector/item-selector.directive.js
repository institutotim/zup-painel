'use strict';

angular
  .module('ItemSelectorDirectiveModule', [
    'SelectListComponentModule'
  ])
  .directive('itemSelector', function ($document, $timeout) {
    return {
      restrict: 'E',
      scope: {
        promiseGenerator: '&',
        onItemSelect: '&',
        onItemUnselect: '&',
        title: '=',
        selectedItemsIds: '=?',
        multiple: '='
      },
      templateUrl: 'components/item-selector/item-selector.template.html',
      controllerAs: 'itemSelectorCtrl',
      controller: function ($scope) {
        $scope.selectedItemsIds = $scope.selectedItemsIds || [];

        $scope.getExcerpt = function () {
          if ($scope.selectedItemsIds && $scope.selectedItemsIds.length > 0) {
            if ($scope.selectedItemsIds.length == 1) {
              return _.findWhere($scope.items, {id: $scope.selectedItemsIds[0]}).title;
            } else {
              return $scope.selectedItemsIds.length + ' itens selecionados.';
            }
          }

          if ($scope.title) {
            return $scope.title;
          }

          return 'Selecione um item';
        };

        $scope.select = function (item) {
          if (!$scope.selected(item)) {
            if ($scope.onItemSelect) {
              $scope.onItemSelect({item: item});
            }

            $scope.selectedItemsIds.push(item.id);
          } else {
            $scope.selectedItemsIds.splice($scope.selectedItemsIds.indexOf(item.id), 1);
            if ($scope.onItemUnselect) {
              $scope.onItemUnselect({item: item});
            }
          }

          if (!$scope.multiple) {
            $scope.show = false;
          }
        };

        $scope.selected = function (item) {
          return _.include($scope.selectedItemsIds, item.id);
        };

        $scope.loadingItems = true;
        $scope.errorLoadingItems = false;

        $scope.promiseGenerator().then(function (response) {
          if (response.data && response.data.categories) {
            $scope.items = response.data.categories;
          } else {
            $scope.items = response;
          }
          $scope.loadingItems = false;
        }, function () {
          $scope.loadingItems = false;
          $scope.errorLoadingItems = true;
        });
      },
      link: function ($scope, element) {
        var windowClick = function (event) {
          if (!$(event.target).closest(element).length) {
            $scope.show = false;

            $scope.$apply();

            angular.element($document).off('click', windowClick);
          }
        };

        $scope.toggleList = function () {
          $scope.show = !$scope.show;

          if (!$scope.show) {
            angular.element($document).off('click', windowClick);
          }
          else {
            angular.element($document).on('click', windowClick);
          }
        };

        $scope.$on('$destroy', function () {
          angular.element($document).off('click', windowClick);
        });
      }
    };
  });

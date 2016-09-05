(function (angular) {
  'use strict';

  angular
    .module('ItemsCategoriesEditOptionsModalControllerModule', [
      'NgThumbComponentModule'
    ])
    .controller('ItemsCategoriesEditOptionsModalController', ItemsCategoriesEditOptionsModalController)
    .factory('ItemsCategoriesEditOptionsModalService', ItemsCategoriesEditOptionsModalService);

  ItemsCategoriesEditOptionsModalController.$inject = [
    '$scope',
    '$modalInstance',
    'category',
    'uploaderQueue',
    'FileUploader',
    'singleItemUploaderFilter',
    'onlyImagesUploaderFilter',
    'send'
  ];
  function ItemsCategoriesEditOptionsModalController($scope, $modalInstance, category, uploaderQueue, FileUploader, singleItemUploaderFilter, onlyImagesUploaderFilter, send) {
    $scope.save = _save;
    $scope.close = _close;

    function _save() {
      var originalColor = angular.copy($scope.category.color);
      $scope.category.color = $scope.color;

      $scope.loading = true;
      var promise = send();
      promise.then(function () {
        $modalInstance.close();
        $scope.loading = false;
      }).catch(function () {
        $scope.category.color = originalColor;
      });
    }

    function _close() {
      $modalInstance.close();
    }

    function _initialize() {
      $scope.color = angular.copy(category.color);

      $scope.category = category;
      $scope.uploaderQueue = uploaderQueue;

      $scope.icon = category.original_icon; // jshint ignore:line

      // Image uploader
      var uploader = $scope.uploader = new FileUploader();

      // Images only
      uploader.filters.push(onlyImagesUploaderFilter(uploader.isHTML5));

      /**
       * @todo Bug on angular-file-upload
       * https://github.com/nervgh/angular-file-upload/issues/290
       */
      uploader.filters.push(singleItemUploaderFilter);

      uploader.onAfterAddingFile = function () {
        $scope.$apply(function () {
          $scope.uploaderQueue.items = uploader.queue;
        });
      };
    }

    _initialize();
  }

  ItemsCategoriesEditOptionsModalService.$inject = [
    '$modal',
    '$q'
  ];
  function ItemsCategoriesEditOptionsModalService($modal, $q) {
    return {
      open: function (category, uploaderQueue, send) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/items/categories/edit-options/items-categories-edit-options.template.html',
          windowClass: 'editCategory',
          resolve: {
            category: function () {
              return category;
            },

            uploaderQueue: function () {
              return uploaderQueue;
            },

            send: function () {
              return function () {
                return send();
              }
            }
          },
          controller: 'ItemsCategoriesEditOptionsModalController'
        });

        return deferred.promise;
      }
    }
  }

})(angular);

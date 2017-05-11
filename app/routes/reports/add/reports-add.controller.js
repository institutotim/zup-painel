'use strict';

angular
  .module('ReportsAddControllerModule', [
    'SelectListComponentModule',
    'ReportsSelectUserModalControllerModule',
    'UsersEditModalModule',
    'ReportSearchMapComponentModule',
    'MapNewReportComponentModule',
    'UsersSelectorComponentModule',
    'NgThumbComponentModule'
  ])

  .controller('ReportsAddController', function (ENV, $scope, $rootScope, Restangular, $q, $modal, $state, FileUploader, onlyImagesUploaderFilter, reportCategoriesResponse, inventoriesCategoriesResponse, UsersEditModalService) {
    var categories = reportCategoriesResponse.data;

    $scope.address = {
      city: ENV.defaultCity,
      state: ENV.defaultState,
      country: ENV.defaultCountry
    };

    $scope.categories = categories;
    $scope.createAnother = false;

    $scope.inventoryCategories = inventoriesCategoriesResponse.data;

    var uploader = $scope.uploader = new FileUploader();
    $scope.selectedCategory = null;

    uploader.filters.push(onlyImagesUploaderFilter(uploader.isHTML5));

    $scope.getInventoryCategory = function (id) {
      for (var i = $scope.inventoryCategories.length - 1; i >= 0; i--) {
        if ($scope.inventoryCategories[i].id === id) {
          return $scope.inventoryCategories[i];
        }
      }

      return null;
    };

    var updateCategoryData = function (categoryData) {
      $scope.has_custom_fields = categoryData.custom_fields && categoryData.custom_fields.length > 0;
      if($scope.has_custom_fields) {
        $scope.custom_fields = {};
      }
      return $scope.categoryData = categoryData;
    };

    $scope.$watch('selectedCategory', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        for (var i = $scope.categories.length - 1; i >= 0; i--) {
          if ($scope.categories[i].id === parseInt($scope.selectedCategory)) {
            return updateCategoryData($scope.categories[i]);
          }

          // we search into subcategories
          if ($scope.categories[i].subcategories.length !== 0) {
            for (var j = $scope.categories[i].subcategories.length - 1; j >= 0; j--) {
              if ($scope.categories[i].subcategories[j].id === parseInt($scope.selectedCategory)) {
                return updateCategoryData($scope.categories[i].subcategories[j]);
              }
            }
          }
        }
      }
    });

    $scope.onUserSelect = function (user) {
      $scope.user = user;
    };

    $scope.unselectUser = function () {
      $scope.user = undefined;
    };

    $scope.createUser = function () {
      UsersEditModalService
        .open()
        .then(function (user) {
          $scope.user = user;
        });
    };

    $scope.editUser = function () {
      UsersEditModalService
        .open($scope.user)
        .then(function (user) {
          $scope.user = user;
        });
    };

    var addAsyncImage = function (img) {
      var deferred = $q.defer();

      var picReader = new FileReader();

      picReader.addEventListener('load', function (event) {
        var picFile = event.target;
        var image = {};
        image.content = picFile.result.replace(/^data:image\/[^;]+;base64,/, '');
        image.title = img.file.title;
        image.file_name = img.file.name;
        image.visibility = (img.file.visibility) ? 'internal' : 'visible';
        image.origin = 'fiscal';
        deferred.resolve(image);
      });
      // pass as base64 and strip data:image
      picReader.readAsDataURL(img._file);
      return deferred.promise;
    };

    $scope.$on('reportMap:position_changed', function (e, latLng) {
      $scope.lat = latLng.lat();
      $scope.lng = latLng.lng();
    });

    var lastAddress = $scope.address.address, lastNumber = $scope.address.number;
    var wasPositionUpdated = false;
    $scope.fieldOnEnter = function (previousField, currentField) {
      if (previousField.name == 'address' || $scope.address.address == '' || $scope.address.number == '') {
        wasPositionUpdated = false;
        return;
      }
      if ($scope.address.address != lastAddress || $scope.address.number != parseInt(lastNumber, 10)) {
        wasPositionUpdated = true;
        lastAddress = $scope.address.address;
        lastNumber = $scope.address.number;
        $scope.$broadcast('addressChanged');
      }
    };

    $scope.addressChanged = function() {
      $scope.$broadcast('addressChanged');
    };

    $scope.$on('reports:position-updated', function (e, location) {
      $scope.lat = location.lat();
      $scope.lng = location.lng();
      if (!wasPositionUpdated) {
        $scope.$broadcast('addressChanged', true);
      }
    });

    $scope.isReadyToSave = function () {
      var invalidImages = _.filter($scope.uploader.queue, function (image) {
        return (image.file.title || '').length > 120;
      });

      $scope.description = $scope.description || '';
      return ($scope.description.length < 800 && $scope.address.address && !$scope.markerOutOfBounds && $scope.user && _.size(invalidImages) === 0);
    };

    $scope.send = function () {
      $rootScope.resolvingRequest = true;

      var imagesPromises = [];

      for (var i = $scope.uploader.queue.length - 1; i >= 0; i--) {
        imagesPromises.push(addAsyncImage($scope.uploader.queue[i]));
      }

      $q.all(imagesPromises).then(function (images) {
        var newReport = {
          latitude: $scope.lat,
          longitude: $scope.lng,
          inventory_item_id: $scope.itemId,
          description: $scope.description,
          reference: $scope.address.reference,
          address: $scope.address.address,
          number: $scope.address.number,
          district: $scope.address.district,
          city: $scope.address.city,
          state: $scope.address.state,
          country: $scope.address.country,
          postal_code: $scope.address.postal_code,
          images: images,
          custom_fields: $scope.custom_fields,
          return_fields: 'id'
        };

        if ($scope.user) {
          newReport.user_id = $scope.user.id;
        }

        var newReportPromise = Restangular.one('reports', $scope.selectedCategory).customPOST(newReport, 'items');

        newReportPromise.then(function (response) {
          $scope.showMessage('ok', 'O relato foi criado com sucesso.', 'success', true);

          if ($scope.createAnother) {
            $scope.lat = null;
            $scope.lng = null;
            $scope.itemId = null;
            $scope.description = null;
            $scope.formattedAddress = null;
            $scope.reference = null;
            $scope.user = null;
            $scope.address = {};

            $scope.uploader.clearQueue();

            $rootScope.resolvingRequest = false;
          } else {
            $state.go('reports.show', {id: response.data.id});
          }
        });

      });
    };
  });

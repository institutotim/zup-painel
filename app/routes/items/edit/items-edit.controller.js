'use strict';

angular
    .module('ItemsEditControllerModule', [
      'ItemsRestoreModalControllerModule',
      'ItemsSelectAddressModalControllerModule',
      'InventoriesItemsServiceModule',
      'NgThumbComponentModule',
      'TranslateErrorsHelperModule',
      'OnEnterComponentModule'
    ])

    .controller('ItemsEditController', function ($scope, Restangular, $q, $state, $modal, $rootScope, FileUploader, onlyImagesUploaderFilter, $localStorage, itemResponse, categoryResponse, $timeout, User, InventoriesItemsService, ReturnFieldsService) {
      var updating = $scope.updating = false;

      var categoryId = categoryResponse.data.id;
      var restoreItemKey = categoryId.toString() + categoryResponse.data.updated_at;

      var itemData = $scope.itemData = {};
      var tempSavedItem, hasPreviousItem = false;

      $scope.uploaders = {};
      $scope.isObject = _.isObject;

      if (itemResponse)
      {
        var itemId = itemResponse.data.id;
        updating = true;
        $scope.updating = true;
      }

      // set up localStore to save items that are being written (and future restored)
      $scope.storage = $localStorage;

      $scope.back = function() {
        if (itemResponse) $state.transitionTo('items.show', { id: itemId }, {'reload': true});
        else $state.transitionTo('items.list', null, {'reload': true});
      };

      $scope.isUnselected = function (checkbox) {
        return _.chain(checkbox)
          .values()
          .find(function (value) { return value; })
          .isUndefined()
          .value();
      };

      // if category doesn't exist in localStorage, create a null object for it
      if (!updating)
      {
        if (typeof $scope.storage.creating === 'undefined')
        {
          $scope.storage.creating = {};
          $scope.storage.creating[restoreItemKey] = null;
        }
        else
        {
          // check if category exists in $scope.storage.creating
          if (typeof $scope.storage.creating[restoreItemKey] === 'undefined')
          {
            $scope.storage.creating[restoreItemKey] = null;
          }
        }

        if ($scope.storage.creating[restoreItemKey] !== null)
        {
          tempSavedItem = angular.copy($scope.storage.creating[restoreItemKey]);

          hasPreviousItem = true;
        }
      }
      else
      {
        // we first check if we have $scope.storage.updating
        if (typeof $scope.storage.updating === 'undefined')
        {
          $scope.storage.updating = {};
          $scope.storage.updating[restoreItemKey] = {};
          $scope.storage.updating[restoreItemKey][itemId] = null;
        }
        else
        {
          // if we do have it then let's check if we have the category object
          if (typeof $scope.storage.updating[restoreItemKey] === 'undefined')
          {
            $scope.storage.updating[restoreItemKey] = {};
            $scope.storage.updating[restoreItemKey][itemId] = null;
          }
          else
          {
            if (typeof $scope.storage.updating[restoreItemKey][itemId] === 'undefined')
            {
              $scope.storage.updating[restoreItemKey][itemId] = null;
            }
          }
        }

        if ($scope.storage.updating[restoreItemKey][itemId] !== null)
        {
          tempSavedItem = angular.copy($scope.storage.updating[restoreItemKey][itemId]);

          hasPreviousItem = true;
        }
      }

      if (hasPreviousItem)
      {
        $modal.open({
          templateUrl: 'modals/items/restore/items-restore.template.html',
          windowClass: 'removeModal',
          resolve: {
            setItemData: function() {
              return function() { itemData = $scope.itemData = angular.copy(tempSavedItem) };
            },

            clearData: function() {
              return function() {
                if (updating)
                {
                  $scope.storage.updating[restoreItemKey][itemId] = null;
                }
                else
                {
                  $scope.storage.creating[restoreItemKey] = null;
                }
              };
            }
          },
          controller: 'ItemsRestoreModalController'
        });
      }

      $scope.hiddenFields = [];
      var locationFieldsIds = $scope.locationFieldsIds = [];
      $scope.locationFields = [];

      $scope.item = {inventory_status_id: null}; // jshint ignore:line

      $scope.category = categoryResponse.data;
      $scope.item.category = $scope.category;

      // create an object with all the possible fields values
      for (var i = $scope.category.sections.length - 1; i >= 0; i--) {
        for (var j = $scope.category.sections[i].fields.length - 1; j >= 0; j--) {
          var section = $scope.category.sections[i];

          if (typeof section !== 'undefined' && (!section.disabled || updating))
          {
            // we leave as null for empty fields
            itemData[section.fields[j].id] = null;

            if (section.fields[j].kind === 'checkbox')
            {
              var optionsObj = {};

              // we leave all the options checked as blank
              /* jshint ignore:start */
              if (section.fields[j].field_options !== null)
              {
                for (var b = section.fields[j].field_options.length - 1; b >= 0; b--) {
                  optionsObj[section.fields[j].field_options[b].id] = false;
                }
              }
              /* jshint ignore:end */

              if ($.isEmptyObject(optionsObj))
              {
                itemData[section.fields[j].id] = null;
              }
              else
              {
                itemData[section.fields[j].id] = optionsObj;
              }
            }

            // detect location fields
            if (section.location === true && section.fields[j].disabled === false)
            {
              if (section.fields[j].title === 'latitude')
              {
                $scope.locationFieldsIds[0] = section.fields[j].id;
                $scope.locationFields[0] = section.fields[j];
                $scope.hiddenFields.push(section.fields[j].id);
              }

              if (section.fields[j].title === 'longitude')
              {
                $scope.locationFieldsIds[1] = section.fields[j].id;
                $scope.hiddenFields.push(section.fields[j].id);
              }

              if (section.fields[j].title === 'address')
              {
                $scope.locationFieldsIds[2] = section.fields[j].id;
              }

              if (section.fields[j].title === 'postal_code')
              {
                $scope.locationFieldsIds[3] = section.fields[j].id;
              }

              if (section.fields[j].title === 'district')
              {
                $scope.locationFieldsIds[4] = section.fields[j].id;
              }

              if (section.fields[j].title === 'city')
              {
                $scope.locationFieldsIds[5] = section.fields[j].id;
              }

              if (section.fields[j].title === 'state')
              {
                $scope.locationFieldsIds[6] = section.fields[j].id;
              }
            }

            if (section.fields[j].kind === 'images')
            {
              var uploader = new FileUploader();

              uploader.filters.push(onlyImagesUploaderFilter(uploader.isHTML5));

              $scope.uploaders[section.fields[j].id] = uploader;

              itemData[section.fields[j].id] = {areImages: true};
            }
          }
        }
      }

      // we save the item data everytime user changes something
      if (!updating)
      {
        $scope.$watch('itemData', function(newValue, oldValue) {
          if (!angular.equals(newValue, oldValue))
          {
            $scope.storage.creating[restoreItemKey] = angular.copy(newValue);
          }
        }, true);
      }

      if (updating)
      {
        $scope.item = itemResponse.data;

        if ($scope.item.locked === true && ($scope.item.locker_id !== User.id))
        {
          $scope.locked = true;
        }

        var getFieldById = function(id) {
          for (var i = $scope.item.data.length - 1; i >= 0; i--) {

            if (typeof $scope.item.data[i].field !== 'undefined' && $scope.item.data[i].field !== null && $scope.item.data[i].field.id == id) // jshint ignore:line
            {
              return $scope.item.data[i];
            }
          }
        };

        // populate itemData with item information
        for (var x in itemData)
        {
          var data = getFieldById(x);

          if (typeof data !== 'undefined')
          {
            // we detect if it's a checkbox by checking if the value is an array
            if (data.field.kind === 'checkbox' && data.content !== null)
            {
              for (var i = data.content.length - 1; i >= 0; i--) {
                itemData[x][data.content[i]] = true;
              }
            }
            else if (data.field.kind === 'images' && data.content !== null)
            {
              itemData[x].existingImages = data.content;
            }
            else
            {
              itemData[x] = data.content;
            }
          }
        }

        // we save the item data everytime user changes something
        $scope.$watch('itemData', function(newValue, oldValue) {
          if (!angular.equals(newValue, oldValue))
          {
            $scope.storage.updating[restoreItemKey][itemId] = angular.copy(newValue);
          }
        }, true);

        var repeatTimeout = true;

        // we are updating an item, so every 45 seconds we make a new PATCH /inventory/categories/:category_id/items/:id/update_access to lock the item
        var lockItem = function() {
          Restangular.all('inventory').one('categories', categoryId).one('items', itemId).all('update_access').patch();

          var timeout = $timeout(function() {
            if (repeatTimeout) lockItem();
          }, 45000);
        };

        if (!$scope.item.locked || ($scope.item.locked === true && ($scope.item.locker_id == User.id)))
        {
          lockItem();
        }

        $scope.$on('$destroy', function() {
          repeatTimeout = false;
        });
      }

      $scope.userCanEditAllFields = $scope.hasPermission('inventories_full_access') ||
        $scope.hasPermission('inventories_categories_edit', $scope.category.id) ||
        $scope.hasPermission('inventories_items_edit', $scope.category.id);

      $scope.openMapModal = function () {
        var mapModalInstance =  $modal.open({
          templateUrl: 'modals/items/select-address/items-select-address.template.html',
          windowClass: 'mapModal',
          resolve: {
            category: function() {
              return $scope.category;
            },

            updating: function() {
              return updating;
            },

            itemData: function() {
              return itemData;
            },

            locationFieldsIds: function() {
              return locationFieldsIds;
            }
          },
          controller: 'ItemsSelectAddressModalController'
        });

        mapModalInstance.opened.then(function () {
          setTimeout(function() {
            $rootScope.selectLatLngMap.start();
          }, 80);
        });
      };

      $scope.send = function() {
        if ($scope.form.$invalid)
        {
          $scope.showValidationError = true;
          return false;
        }

        $scope.processingForm = true;
        var imagesFieldsPromises = [];

        var formattedData = {inventory_status_id: $scope.item.inventory_status_id, data: {}}; // jshint ignore:line

        // process images
        function addAsyncImage(img) {
          var deferred = $q.defer();

          var picReader = new FileReader();

          picReader.addEventListener('load', function(event) {
            var picFile = event.target;

            deferred.resolve(picFile.result.replace(/^data:image\/[^;]+;base64,/, ''));
          });

          // pass as base64 and strip data:image
          picReader.readAsDataURL(img);

          return deferred.promise;
        }

        var addAsyncImagesField = function(item, id) {
          var deferred = $q.defer();

          var imagesPromises = [];

          for (var i = item.queue.length - 1; i >= 0; i--) {
            imagesPromises.push(addAsyncImage(item.queue[i]._file));
          }

          $q.all(imagesPromises).then(function(images) {
            var imagesObj = [];

            for (var i = images.length - 1; i >= 0; i--) {
              imagesObj.push({'content': images[i]});
            };

            // we add the images with the other field's images, if any were to be destroyed
            if (imagesObj.length !== 0)
            {
              if (typeof formattedData.data[id] === 'undefined')
              {
                formattedData.data[id] = imagesObj;
              }
              else
              {
                for (var i = imagesObj.length - 1; i >= 0; i--) {
                  formattedData.data[id].push(imagesObj[i]);
                };
              }
            }

            // we processed all the images for this field! :-D
            deferred.resolve();
          });

          return deferred.promise;
        }

        // we need to format our data
        for (var x in itemData)
        {
          if (!isNaN(parseInt(x, 10)) && itemData[x] !== null)
          {
            if (typeof itemData[x] === 'object')
            {
              if (itemData[x].areImages === true)
              {
                imagesFieldsPromises.push(addAsyncImagesField($scope.uploaders[x], x));

                if (typeof itemData[x].existingImages !== 'undefined')
                {
                  for (var i = itemData[x].existingImages.length - 1; i >= 0; i--) {
                    if (itemData[x].existingImages[i].destroy === true)
                    {
                      if (typeof formattedData.data[x] === 'undefined')
                      {
                        formattedData.data[x] = [{ id: itemData[x].existingImages[i].id, destroy: true }];
                      }
                      else
                      {
                        formattedData.data[x].push({ id: itemData[x].existingImages[i].id, destroy: true });
                      }
                    }
                  }
                }
              }
              else
              {
                var selectedItems = [];

                for (var z in itemData[x])
                {
                  if (itemData[x][z] === true)
                  {
                    selectedItems.push(parseInt(z));
                  }
                }

                if (selectedItems.length !== 0) formattedData.data[x] = selectedItems;
              }
            }
            else
            {
              formattedData.data[x] = itemData[x];
            }
          }
        }

        $q.all(imagesFieldsPromises).then(function() {
          if (updating) {
            InventoriesItemsService
              .update(itemId, categoryId, formattedData)
              .then(function(item) {
                $scope.storage.updating[restoreItemKey][itemId] = null;

                $scope.showMessage('ok', 'O item foi atualizado com sucesso!', 'success', true);
                $scope.processingForm = false;

                $state.go('items.show', { id: itemId }, { reload: true });
              })
              .catch(function(err) {
                $scope.inputErrors = err;
                $scope.processingForm = false;
              });
          } else {
            InventoriesItemsService
              .create(categoryId, formattedData)
              .then(function(item) {
                $scope.storage.creating[restoreItemKey] = null;

                $scope.showMessage('ok', 'O item foi criado com sucesso', 'success', true);
                $state.go('items.show', {id: item.id});
              })
              .catch(function(err) {
                $scope.inputErrors = err;
                $scope.processingForm = false;
              });
          }
        });
      };
    });

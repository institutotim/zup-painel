'use strict';

/**
 * Provides an API client for the reports categories from ZUP API
 * @module InventoriesCategoriesService
 */
angular
  .module('InventoriesCategoriesServiceModule', [])
  .factory('InventoriesCategoriesService', function ($rootScope, $q, Restangular, FullResponseRestangular, ReturnFieldsService) {
    var self = {};
    self.categories = {};
    self.categoriesStatuses = {};
    self.loadedBasicInfo = false;

    /**
     * Process local categories and statuses refreshing
     * @param {Object} response - FullResponseRestangular response object
     */
    var updateCache = function (response) {
      _.each(response.data.categories, function (category) {
        self.categories[category.id] = category;

        _.each(category.statuses, function (status) {
          self.categoriesStatuses[status.id] = status
        });
      });

      $rootScope.$emit('inventoriesCategoriesFetched', self.categories);
    };

    /**
     * Clears current cache
     * @returns {Object} Restangular promise for basic category fields
     */
    self.purgeCache = function() {
      self.categories = {};
      self.categoriesStatuses = {};
      self.loadedBasicInfo = false;

      return self.fetchAllBasicInfo();
    };

    /**
     * Fetches basic information for all categories
     * This function is safe to call multiple times and will not duplicate categories in the cache
     * @returns {Object} Restangular promise for basic category fields fetching
     */
    self.fetchAllBasicInfo = function () {
      var url = FullResponseRestangular.all('inventory').all('categories'), options = { };

      options.display_type = 'full';
      options.return_fields = ReturnFieldsService.convertToString([
        "id", "title", "pin", "plot_format", "color",
        {
          "statuses": [
            "id", "color", "title"
          ],
          "marker": [
            {
              "retina": [
                "web"
              ]
            }
          ]
        }
      ]);

      var promise = url.customGET(null, options);

      promise.then(function (response) {
        self.loadedBasicInfo = false;
        updateCache(response);
      });

      return promise;
    };

    /**
     * Fetches all categories marked for deletion
     * This function is safe to call multiple times and will not duplicate categories in the cache
     * @returns {Object} Restangular promise for basic category fields fetching
     */
    self.fetchAllDeleted = function () {
      var url = FullResponseRestangular.all('inventory').all('categories').all('deleted'), options = { };

      options.display_type = 'full';
      options.return_fields = ReturnFieldsService.convertToString([
        "id", "title", "pin", "plot_format", "color", "days_for_deletion",
        {
          "statuses": [
            "id", "color", "title"
          ],
          "marker": [
            {
              "retina": [
                "web"
              ]
            }
          ]
        }
      ]);

      var promise = url.customGET(null, options);
      return promise;
    };


    /**
     * Returns pairs of IDs and Titles for all inventory categories
     * @returns {*}
     */
    self.fetchTitlesAndIds = function () {
      var url = FullResponseRestangular.all('inventory').all('categories'), options = {};

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO
      options.return_fields = ReturnFieldsService.convertToString(['id', 'title']);

      return url.customGET(null, options);
    };

    /**
     * Get an inventory category by it's ID
     * @param  {int|string} id reqyested ategory ID
     * @return {Object} Restangular promise with full info about the category
     */
    self.getCategory = function(id) {
      // TODO we must implement a cached version
      var promise = Restangular.one('inventory').one('categories', id).get({display_type: 'full'});

      return promise;
    };

    /**
     * Create a inventory category
     * @param {Object} category
     * @return {Object} Restangular promise
     */
    self.create = function (category) {
      return Restangular
        .one('inventory')
        .withHttpConfig({ treatingErrors: true })
        .post('categories', category)
        .then(function (response) {
          return response.data;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    self.update = function (id, category) {
      return FullResponseRestangular
        .one('inventory')
        .one('categories', id)
        .withHttpConfig({ treatingErrors: true })
        .customPUT(category)
        .then(function (response) {
          return response.data;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    self.updateForm = function (id, formData) {
      return FullResponseRestangular
        .one('inventory')
        .one('categories', id)
        .one('form')
        .withHttpConfig({ treatingErrors: true })
        .customPUT(formData)
        .then(function (response) {
          return response.data.form;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    /*
     * Restore a deleted category
     * @returns Promise
     */
    self.restoreCategory = function(category) {
      return Restangular.one('inventory').one('categories', category.id).one('restore').customPUT();
    }


    return self;
  });

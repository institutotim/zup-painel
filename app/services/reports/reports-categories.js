'use strict';

/**
 * Provides an API client for the reports categories from ZUP API
 * @module ReportsCategoriesService
 */
angular
  .module('ReportsCategoriesServiceModule', [])
  .factory('ReportsCategoriesService', function ($rootScope, $q, FullResponseRestangular, Restangular, ReturnFieldsService) {
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
        _.each(category.subcategories, function (subcategory) {
          self.categories[subcategory.id] = subcategory;
        });

        self.categories[category.id] = category;

        _.each(category.statuses, function (status) {
          self.categoriesStatuses[status.id] = status
        });
      });

      $rootScope.$emit('reportsCategoriesFetched', self.categories);
    };

    /**
     * Clears current cache
     * @returns {Object} Restangular promise for basic category fields
     */
    self.purgeCache = function () {
      self.categories = {};
      self.categoriesStatuses = {};
      self.loadedBasicInfo = false;

      return self.fetchAllBasicInfo();
    };

    /**
     * Returns a list of statuses for a given category
     * @param categoryId
     * @returns {*|{method, params, headers}}
     */
    self.getStatusesByCategory = function (categoryId) {
      return Restangular.one('reports').one('categories', categoryId).all('statuses').getList();
    };

    /**
     * Returns a list of pairs with categories and its ID
     */
    self.fetchTitlesAndIds = function () {
      var url = FullResponseRestangular.all('reports').all('categories'), options = {};

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO
      options.subcategories_flat = true;
      options.return_fields = ReturnFieldsService.convertToString(['id', 'title']);

      return url.customGET(null, options);
    };

    /**
     * Fetches basic information for all categories
     * This function is safe to call multiple times and will not duplicate categories in the cache
     * @returns {Object} Restangular promise for basic category fields fetching
     */
    self.fetchAllBasicInfo = function () {
      var url = FullResponseRestangular.all('reports').all('categories'), options = {};

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO
      options.subcategories_flat = true;
      options.return_fields = ReturnFieldsService.convertToString([
        "id", "title", "priority", "priority_pretty", "pin", "parent_id", "color", "icon",
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
        self.loadedBasicInfo = true;
        updateCache(response);
      });

      return promise;
    };

    /**
     * Fetches id, title and subcategories
     * @returns {Array} fetched categories
     */
    self.fetchTitlesAndIds = function(){
      var request = FullResponseRestangular.all('reports').all('categories'), deferred = $q.defer(), options = {};

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO
      options.subcategories_flat = false;
      options.return_fields = ReturnFieldsService.convertToString([
        "id", "title",
        {
          "subcategories": [
            "id", "title"
          ]
        }
      ]);

      var promise = request.customGET(null, options);

      promise.then(function (response) {
        deferred.resolve(response.data.categories);
      }, function(response){
        deferred.reject(response);
      });

      return deferred.promise;
    };

      /**
       * Return a list of all custom fields from all categories
       * @returns {resolve.promise|p.promise|{then, fail, end}|*|r.promise|promise}
       */
    self.getAllCustomFields = function () {
      var deferred = $q.defer();

      var requestPromise = FullResponseRestangular.all('reports').all('categories').customGET(null, {
        display_type: 'full',
        return_fields: 'custom_fields'
      });

      requestPromise.then(function (response) {
        var customFields = _.uniq(_.flatten(_.map(response.data.categories, function (category) {
          return category.custom_fields
        })), function (field) {
          return field.id;
        });

        deferred.resolve(customFields);
      });

      return deferred.promise;
    };

    return self;
  });

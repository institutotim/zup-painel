'use strict';

/**
 * Provides an API client for the reports items from ZUP API
 * @module ReportsItemsServiceModule
 */
angular
  .module('ReportsItemsServiceModule', ['ReportsCategoriesServiceModule'])
  .factory('ReportsItemsService', function ($q, $rootScope, FullResponseRestangular, ReportsCategoriesService, ReturnFieldsService) {
    var self = {}, reportsOrder = 0;
    self.reports = {};
    self.total = 0;
    self.clusters = [];

    /**
     * Clear service state
     */
    self.resetCache = function () {
      self.reports = {};
      self.clusters = [];
      self.total = 0;
      reportsOrder = 0;
    };

    /**
     * Clears items and clusters, but not total
     */
    self.resetItemsAndClusters = function(){
      reportsOrder = 0;
      self.reports = {};
      self.clusters = [];
    };

    /**
     * Fetches report items using hte search report endpoint
     * @param {Object} options - API options for the search report endpoint
     * @returns {Object} promise called for successful responses alone
     */
    self.fetch = function (options, reports) {
      options = options || {};

      var url = FullResponseRestangular.one('search').all('reports').all('items'); // jshint ignore:line

      var defaults = {
        display_type: 'full',
        return_fields: ReturnFieldsService.convertToString([
          "id", "protocol", "address", "category_id", "status_id", "created_at", "overdue", "overdue_at", "custom_fields",
          {
            "category": [
              "title", "priority_pretty"
            ],
            "assigned_group": [
              "name", "title"
            ],
            "assigned_user": [
              "name", "id"
            ],
            "user": [
              "name", "id"
            ],
            "reporter": [
              "name", "id"
            ],
            "notifications": [
              "deadline_in_days", "days_to_deadline",
              {
                "notification_type": [
                  "title"
                ]
              }
            ]
          }
        ])
      };

      // merge options into defaults
      angular.merge(defaults, options);

      // Categories are always updated in parallel on fetch operations
      var categoryFetchPromise = ReportsCategoriesService.fetchAllBasicInfo();

      var promise = url.customGET(null, defaults);

      var deferred = $q.defer();

      $rootScope.$broadcast('reportsItemsFetching');

      promise.then(function (response) {
        _.each(response.data.reports, function (report)
        {
          if (typeof reports[report.id] === 'undefined')
          {
            report.order = reportsOrder++;
          }

          reports[report.id] = report;
        });

        self.total = parseInt(response.headers().total, 10);

        // If there isn't any category on cache, we wait on them before presenting items
        if (_.size(ReportsCategoriesService.categories) < 1)
        {
          categoryFetchPromise.then(function () {
            setCategoryOnItems(reports);

            $rootScope.$broadcast('reportsItemsFetched', reports);

            deferred.resolve(reports);
          });
        }
        else
        {
          // TODO This may cause problems for items of categories that are not yet present
          setCategoryOnItems(reports);

          $rootScope.$broadcast('reportsItemsFetched', reports);

          deferred.resolve(reports);
        }
      });

      return deferred.promise;
    };

    self.fetchCSV = function (options) {
      angular.merge(options, { 'disable_paginate': 'true' });

      return self.fetch(options, {});
    }

    self.fetchAll = function (options) {
      return self.fetch(options, self.reports);
    }

    /**
     * Fetches reports items and clusters for a given position. Unordered.
     * @param options - API request options
     */
    self.fetchClustered = function (options) {
      var url = FullResponseRestangular.one('search').all('reports').all('items'); // jshint ignore:line

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO
      options.return_fields = ReturnFieldsService.convertToString([
        'id', 'protocol', 'address', 'category_id', 'categories_ids', 'status_id', 'created_at', 'overdue', 'position',
        { 'user': [ 'name', 'id ']}
      ]);

      var categoryFetchPromise = ReportsCategoriesService.fetchAllBasicInfo();

      var itemsFetchPromise = url.customGET(null, options);

      var deferred = $q.defer();

      $rootScope.$broadcast('reportsItemsFetching');

      itemsFetchPromise.then(function (response) {
        self.total = parseInt(response.headers().total, 10);

        _.each(response.data.reports, function (report) {
          if (typeof self.reports[report.id] === 'undefined')
          {
            report.order = reportsOrder++;
          }

          self.reports[report.id] = report;
        });

        self.clusters = response.data.clusters;

        if (_.size(ReportsCategoriesService.categories) < 1)
        {
          categoryFetchPromise.then(function () {
            hookCategoryFieldsOnClusters();

            hookCategoryFieldsOnReports();

            $rootScope.$broadcast('reportsItemsFetched', self.reports);

            deferred.resolve(self);
          });
        }
        else
        {
          hookCategoryFieldsOnClusters();

          hookCategoryFieldsOnReports();

          $rootScope.$broadcast('reportsItemsFetched', self.reports);

          deferred.resolve(self);
        }
      });

      return deferred.promise;
    };

    /**
     * Removes a single report from the API and the local cache
     * @param {Integer|String} report_id - The report ID to remove
     * @returns {*}
     */
    self.remove = function (report_id) {
      var promise = FullResponseRestangular.one('reports').one('items', report_id).remove(), deferred = $q.defer();

      promise.then(function () {
        delete self.reports[report_id];

        deferred.resolve();
      });

      return deferred.promise;
    };

    /**
     * Binds categories to either reports items or clusters
     * @private
     * @param {Array|Object} items - items to bind the `category` property on
     */
    var setCategoryOnItems = function(items) {
      return _.each(items, function (item) {
        item.category = ReportsCategoriesService.categories[item.category_id];

        if (typeof item.category === 'undefined')
        {
          console.log('Report with unknown category', item);
        }

        item.status = ReportsCategoriesService.categoriesStatuses[item.status_id];
      });
    };

    /**
     * Sets the category property on reports
     * Due to performance reasons, categories are fetched in parallel to the items themselves, so they need to be bound
     * the `category` object
     * @private
     */
    var hookCategoryFieldsOnReports = function () {
      setCategoryOnItems(self.reports);
    };

    /**
     * Sets the category property on clusters
     * Due to performance reasons, categories are fetched in parallel to the items themselves, so they need to be bound
     * the `category` object
     * @private
     */
    var hookCategoryFieldsOnClusters = function () {
      setCategoryOnItems(self.clusters);
    };

    return self;
  });

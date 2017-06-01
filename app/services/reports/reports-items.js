/* global angular, _, async*/
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
    self.suggestions = {};
    self.suggtotal = 0;
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
    self.fetchAll = function (options) {
      options = options || {};

      var url = FullResponseRestangular.one('search').all('reports').all('items'); // jshint ignore:line

      var defaults = {
        display_type: 'full',
        return_fields: ReturnFieldsService.convertToString([
          "id", "protocol", "address", "category_id", "status_id", "created_at", "overdue", "overdue_at",
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

        async.waterfall([

          function (callback) {
            async.each(response.data.reports, populateGroupedItems, callback);
          },

          function (callback) {
            async.each(response.data.reports, loadReports, callback);
          }

        ], finishFetching);

        function populateGroupedItems(report, cb) {
          if (!report.grouped) {
            return cb();
          }

          var reportGroupsPromise = FullResponseRestangular.one('reports').one('items', report.id).all('group')
            .customGET(null, {
              display_type: 'full',
              return_fields: ['id'].join()
            }); // jshint ignore:line

          reportGroupsPromise.then(function (res) {
            if (res.status !== 200) {
              return cb();
            }

            report.grouped_items = [];
            async.each(res.data.reports, function (rep, callback) {
              report.grouped_items.push(rep.id);
              callback();
            }, cb);
          });
        }

        function loadReports(report, cb) {
          if (typeof self.reports[report.id] === 'undefined') {
            report.order = reportsOrder++;
          }
          self.reports[report.id] = report;
          cb();
        }

        function finishFetching() {
          self.total = parseInt(response.headers().total, 10);

          // If there isn't any category on cache, we wait on them before presenting items
          if (_.size(ReportsCategoriesService.categories) < 1) {
            categoryFetchPromise.then(function () {
              hookCategoryFieldsOnReports();

              $rootScope.$broadcast('reportsItemsFetched', self.reports);

              deferred.resolve(self.reports);
            });
          } else {
            // TODO This may cause problems for items of categories that are not yet present
            hookCategoryFieldsOnReports();

            $rootScope.$broadcast('reportsItemsFetched', self.reports);

            deferred.resolve(self.reports);
          }
        }
      });

      return deferred.promise;
    };

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
          if (typeof self.reports[report.id] === 'undefined') {
            report.order = reportsOrder++;
          }

          self.reports[report.id] = report;
        });

        self.clusters = response.data.clusters;

        if (_.size(ReportsCategoriesService.categories) < 1) {
          categoryFetchPromise.then(function () {
            hookCategoryFieldsOnClusters();

            hookCategoryFieldsOnReports();

            $rootScope.$broadcast('reportsItemsFetched', self.reports);

            deferred.resolve(self);
          });
        } else {
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
     * Fetches group suggestions for items.
     * @param options - API request options
     */
    self.fetchSuggestions = function (options) {
      options = options || {page: 1, per_page: 5};

      var url = FullResponseRestangular.one('reports').all('suggestions'); // jshint ignore:line

      options.display_type = 'full'; // temporarily set display_type as full while API is being updated TODO

      var suggestionsFetchPromise = url.customGET(null, options);

      var deferred = $q.defer();

      $rootScope.$broadcast('reportsSuggestionsFetching');

      suggestionsFetchPromise.then(function (response) {
        self.suggestions = {};
        self.suggtotal = parseInt(response.headers().total, 10);

        async.each(response.data.suggestions, function (suggestion, cb) {
          suggestion.reports = {};

          async.each(suggestion.reports_items_ids, function (report_id, cb) {
            var url = FullResponseRestangular.one('reports').one('items', report_id);

            options.display_type = 'full';
            options.return_fields = [
              'id', 'address', 'number', 'category', 'status.color', 'status.title', 'category.title', 'created_at',
              'reporter.name', 'description', 'images'
            ].join();

            url.customGET(null, options).then(function (res) {
              suggestion.reports[report_id] = res.data.report;
              cb();
            });
          }, function () {
            self.suggestions[suggestion.id] = suggestion;
            cb();
          });

        }, finish);

        function finish() {
          $rootScope.$broadcast('reportsSuggestionsFetched', self.suggestions);
          deferred.resolve(self);
        }
      });

      return deferred.promise;
    };

    /**
     * Group given reports
     * @param reports_ids Ids dos relatos separados por virgula (','), ex: '1,2,3'
     */
    self.groupReports = function (reports_ids) {
      _groupUngroupReports(reports_ids, 'group');
    };

    /**
     * Ungroup given reports
     * @param report_id Report id to ungroup
     */
    self.ungroupReport = function (reports_ids) {
      _groupUngroupReports(reports_ids, 'ungroup');
    };

    /**
     * Accepts or ignores a group suggestion
     * @param suggestion The suggestion to be accepted
     * @param action 'group' or 'ignore'
     */
    self.updateSuggestion = function (suggestion, action) {
      var updateSuggestionPromise = FullResponseRestangular
        .one('reports')
        .one('suggestions', suggestion.id)
        .one(action)
        .put();

      $rootScope.$broadcast('updatingReportGroups');

      var deferred = $q.defer();

      updateSuggestionPromise.then(function (response) {
        var message = 'Sugestão ' + (action === 'ignore' ? 'ignorada' : 'aceita') + ' com sucesso.';
        if (response.status !== 200) {
          message = 'Erro ao ' + (action === 'ignore' ? 'ignorar' : 'aceitar') + ' sugestão.';
        }
        $rootScope.$broadcast('reportGroupsUpdated', {
          status: response.status,
          message: message,
          report_id: (action === 'group') ? suggestion.reports_items_ids[0] : null
        });
        deferred.resolve(self);
      });

      return deferred.promise;
    };

    var _groupUngroupReports = function (reports_ids, action) {
      var url = FullResponseRestangular
        .one('reports').one(action);

      var params = { reports_ids: reports_ids };

      var groupReportsPromise;
      if (action === 'group') {
        groupReportsPromise = url.customPOST(params);
      } else if (action === 'ungroup') {
        groupReportsPromise = url.customDELETE(null, params);
      }

      $rootScope.$broadcast('updatingReportGroups');

      var deferred = $q.defer();

      groupReportsPromise.then(function (response) {
        $rootScope.$broadcast('reportGroupsUpdated', {
          status: response.status,
          message: response.data.message,
          report_id: reports_ids.split(',')[0]
        });
        deferred.resolve(self);
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

        if (typeof item.category === 'undefined') {
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

    /**
     *
     * @param color
     * @returns {string}
     */
    self.getReportPopoverTemplate = function (color) {
      return '<div class="popover" role="tooltip">'
        + '<div class="arrow"></div>'
        + '<div class="background" style="background-color: ' + color + ';"></div><h3 class="popover-title" style="color: ' + color + ';"></h3>'
        + '<div class="popover-content"></div>'
        + '</div>';
    };

    /**
     *
     * @type {string}
     */
    self.reportPopoverContent =  '<div id="reportSuggestionPopover" style="display: none;">'
      + '<div class="row">'
      +   '<div ng-show="report.images.length" class="col-md-4 centered-content">'
      +     '<img class="img-thumbnail" src="{{ (report.images[\'0\'] || {}).low }}"/>'
      +   '</div>'
      +   '<div ng-class="{ \'col-md-8\': report.images.length, \'col-md-12\': !report.images.length }">'
      +     '<h5><strong>{{ report.category.title }}</strong></h5>'
      +     '<p>{{ report.address }}<span ng-if="report.number">, {{ report.number }}</span></p>'
      +     '<p style="color: #909090;"><i>{{ report.description }}</i></p>'
      +     '<p>Solicitado por {{ report.user.name }} em {{ report.created_at | date: \'dd/MM/yy HH:mm\'}}</p>'
      +   '</div>'
      +  '</div>'
      + '</div>';

    return self;
  });

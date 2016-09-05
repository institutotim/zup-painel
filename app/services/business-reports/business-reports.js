(function (angular, _) {
  'use strict';

  /**
   * Provides an API client for the business reports from ZUP API
   * @module BusinessReportsServiceModule
   */
  angular
    .module('BusinessReportsServiceModule', [])
    .factory('BusinessReportsService', BusinessReportsService);

  BusinessReportsService.$inject = [
    '$q',
    'FullResponseRestangular',
    'studioViewsService'
  ];
  function BusinessReportsService($q, FullResponseRestangular, studioViewsService) {
    var self = {};

    var ALL_FIELDS = [
      'id', 'title', 'summary', 'params'
    ].join();

    /**
     * Fetches the business reports list
     * @param {Object} options - API options for the search report endpoint
     * @returns {Object} promise
     */
    self.fetchAll = function (options) {
      options = options || {};

      var url = FullResponseRestangular.all('business_reports');

      options.display_type = 'full';
      options.return_fields = [
        'id', 'title', 'summary'
      ].join();

      var promise = url.customGET(null, options);

      var deferred = $q.defer();

      promise.then(function (response) {
        var reports = response.data['business_reports'];
        deferred.resolve(reports);
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    };

    /**
     * Remove a single business report
     * @param {Number} id The business report ID
     * @returns {Object} promise
     */
    self.remove = function (id) {
      var promise = FullResponseRestangular.one('business_reports', id).remove(), deferred = $q.defer();

      promise.then(function (response) {
        deferred.resolve(response);
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    };

    /**
     * Fetches a single business report
     * @param {Number} id The business report ID
     * @returns {Object} promise
     */
    self.find = function (id) {
      var options = {};

      var url = FullResponseRestangular.one('business_reports', id);

      options.display_type = 'full';
      options.return_fields = ALL_FIELDS;

      var promise = url.customGET(null, options);

      var deferred = $q.defer();

      promise.then(function (response) {
        var report = FullResponseRestangular.stripRestangular(response.data['business_report']);
        report._original = angular.copy(report);

        deferred.resolve(_denormalizeReport(report));
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    };

    /**
     * Saves or creates a single business report
     * @param {Object} report The business report
     * @returns {Object} promise
     */
    self.save = function (report) {
      var options = {}, deferred = $q.defer();

      options.return_fields = ALL_FIELDS;

      var reportSavePromise, reportData = _normalizeReport(angular.copy(report));

      if (report.id) {
        reportData.id = report.id;
        reportSavePromise = FullResponseRestangular.one('business_reports', report.id).customPUT(reportData);
        reportSavePromise.then(function (response) {
          var report = response.data['business_report'];
          deferred.resolve(report);
        }, function (response) {
          deferred.reject(response);
        });
      } else {
        reportSavePromise = FullResponseRestangular.one('business_reports').customPOST(reportData);
        reportSavePromise.then(function (response) {
          var report = response.data['business_report'];
          deferred.resolve(report);
        }, function (response) {
          deferred.reject(response);
        });
      }

      return deferred.promise;
    };

    /**
     * Returns true if the fields in the report are considered to be valid
     * @param {Object} report
     * @returns {boolean}
     */
    self.isValid = function (report) {
      var constraints = [];
      constraints.push(_.size(report.title) > 0);
      var nonDeletedCharts = _.filter(report.charts, function (chart) {
        return chart && !chart.deleted;
      });

      if (report.charts && nonDeletedCharts.length > 0) {
        constraints.push(_.every(report.charts, function (chart) {
          if (_.isUndefined(chart) || chart.deleted) {
            return true;
          }
          var view = studioViewsService.views[chart.index];
          return view && chart.title && (chart.title.length > 0);
        }));
      } else {
        return false;
      }

      return _.every(constraints, function (c) {
        return c;
      });
    };

    /**
     *
     */
    self.clearViews = function () {
      studioViewsService.views = [];
    };

    function _normalizeReport(report) {
      var charts;

      if (report.duplicating) {
        charts = report.charts;
      } else {
        charts = _.map(report.charts, function (chart) {
          if (!chart || chart.deleted) return;
          var view = studioViewsService.views[chart.index];
          chart.id = view.id;
          chart.params = view.params;
          return chart;
        });
      }

      charts = _.filter(charts, function (chart) {
        return !_.isUndefined(chart) && !chart.deleted;
      });

      report.params = {};
      _.each(charts, function (param) {
        report.params[param.id] = param;
      });

      return report;
    }

    function _denormalizeReport(report) {
      report.charts = _.map(report.params);
      return report;
    }

    return self;
  }

})(angular, _);

'use strict';

angular
  .module('ConfigServiceModule', ['ReportsCategoriesServiceModule'])
  .factory('ConfigService', function ($q, FullResponseRestangular, ReportsCategoriesService) {
    var self = {
      defaultColumnWidths: {
        'protocol': '30',
        'assignment': '20%',
        'reporter': '10%',
        'address': '20%',
        'user': '10%',
        'category': '20%',
        'created_at': '150',
        'custom_field': '15%'
      }
    };

    self.getReportsColumns = function () {
      var deferred = $q.defer();

      var customFieldsPromise = ReportsCategoriesService.getAllCustomFields();

      var reportsColumnsPromise = FullResponseRestangular.all('settings').customGET();

      $q.all([reportsColumnsPromise, customFieldsPromise]).then(function (responses) {
        var reportsColumns = _.findWhere(responses[0].data.settings, {name: 'reports_listing_columns'}).value;

        var customFields = responses[1];
        var customFieldsColumns = _.map(customFields, function (field) {
          return {id: field.id, type: 'custom_field', label: field.title};
        });

        _.each(customFieldsColumns, function (column) {
          if (!_.findWhere(reportsColumns, {id: column.id})) {
            reportsColumns.push(column);
          }
        });

        _.each(reportsColumns, function (column) {
          column.width = self.defaultColumnWidths[column.type];
        });

        deferred.resolve(reportsColumns);
      });

      return deferred.promise;
    };

    self.updateReportsColumns = function (reportsColumns) {
      return FullResponseRestangular.one('settings', 'reports_listing_columns').customPUT({value: reportsColumns});
    };

    return self;
  });

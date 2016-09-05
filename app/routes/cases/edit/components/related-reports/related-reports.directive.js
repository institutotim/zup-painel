'use strict';


angular
  .module('CaseDirectiveModule')
  .directive('relatedReports', function () {
    return {
      restrict: 'E',
      scope: {
        reports: '=' // It's the related reports returned from case
      },
      templateUrl: 'routes/cases/edit/components/related-reports/related-reports.template.html',
      controller: function ($scope, $rootScope, $state) {
        // Normalizing custom fields
        $scope.$watchCollection("reports", function(_reports, _oldValue) {
          _.each($scope.reports, function(report) {
            var category = report.category;

            report.custom_fields_normalized = _.map(report.custom_fields, function(value, id) {
              var custom_field = _.find(category.custom_fields, function(category_custom_field) {
                return category_custom_field.id == parseInt(id);
              });

              return { title: custom_field.title, value: value };
            });

            return report;
          });
        });
      }
    };
  });

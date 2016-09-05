(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsIndexHeaderDirectiveModule', [])
    .directive('businessReportsIndexHeader', function () {
      return {
        restrict: 'E',
        scope: {
          showAddNewButton: '='
        },
        templateUrl: 'routes/business-reports/index/components/header/business-reports-index-header.template.html'
      };
    });

})(angular);

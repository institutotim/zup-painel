(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsIndexModule', [
      'BusinessReportsIndexControllerModule'
    ])

    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('business_reports.list', {
        url: '',
        views: {
          '': {
            templateUrl: 'routes/business-reports/index/business-reports-index.template.html',
            controller: 'BusinessReportsIndexController',
            controllerAs: 'ctrl'
          }
        }
      });

    }]);

})(angular);

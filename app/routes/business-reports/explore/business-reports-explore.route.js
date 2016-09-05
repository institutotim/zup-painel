(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsExploreModule', [
      'BusinessReportsExploreControllerModule'
    ])

    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('business_reports.explore', {
        url: '/explore',
        views: {
          '': {
            templateUrl: 'routes/business-reports/explore/business-reports-explore.template.html',
            controller: 'BusinessReportsExploreController',
            controllerAs: 'ctrl'
          }
        }
      });

    }]);

})(angular);

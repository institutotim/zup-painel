(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsModule', [
      'BusinessReportsIndexModule',
      'BusinessReportsEditModule',
      'BusinessReportsExploreModule'
    ])
    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('business_reports', {
        url: '/business-reports',
        templateUrl: 'routes/business-reports/business-reports.template.html',
        abstract: true,
        resolve: {
          'User': ['User', function (User) {
            return User({permissions: ['isLogged']});
          }]
        }
      });

    }]);

})(angular);

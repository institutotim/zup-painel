angular
  .module('ReportsPerimetersIndexModule', [
    'ReportsPerimetersIndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.perimeters', {
      url: '/perimeters',
      cache: false,
      views: {
        '': {
          templateUrl: 'routes/reports/perimeters/index/reports-perimeters-index.template.html',
          controller: 'ReportsPerimetersIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

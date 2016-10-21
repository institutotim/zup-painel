angular
  .module('ReportsIndexModule', [
    'ReportsIndexControllerModule',
    'ReportsIndexListModule',
    'ReportsIndexMapModule',
    'MapComponentModule',
    'StyleResultsTableComponentModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.index', {
      abstract: true,
      views: {
        '': {
          templateUrl: 'routes/reports/index/reports-index.template.html',
          controller: 'ReportsIndexController',
          controllerAs: 'ctrlReportsIndex'
        }
      }
    });

  }]);

angular
  .module('ReportsIndexMapModule', [
    'ReportsIndexMapControllerModule',
    'StyleMapComponentModule',
    'MapComponentModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.index.map', {
      url: '/map',

      views: {
        '': {
          templateUrl: 'routes/reports/index/map/reports-index-map.template.html',
          controller: 'ReportsIndexMapController',
          controllerAs: 'ctrlReportsMap'
        }
      }
    });

  }]);

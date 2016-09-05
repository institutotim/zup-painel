angular
  .module('ReportsIndexListModule', [
    'ReportsIndexListControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.index.list', {
      url: '',

      views: {
        '': {
          templateUrl: 'routes/reports/index/list/reports-index-list.template.html',
          controller: 'ReportsIndexListController',
          controllerAs: 'ctrlReportsList'
        }
      }
    });

  }]);

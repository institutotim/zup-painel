angular
  .module('ReportsCategoriesIndexModule', [
    'ReportsCategoriesIndexControllerModule',
    'ReportsCategoriesServiceModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.categories', {
      url: '/categories',
      cache: false,
      views: {
        '': {
          templateUrl: 'routes/reports/categories/index/reports-categories-index.template.html',
          controller: 'ReportsCategoriesIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

angular
  .module('ReportsCategoriesDeletedModule', [
    'ReportsCategoriesDeletedControllerModule',
    'ReportsCategoriesServiceModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    // TODO: Understand why this needs to be with `_` and not
    // reports.categories.deleted
    $stateProvider.state('reports.categories_deleted', {
      url: '/categories/deleted',
      cache: false,
      views: {
        '': {
          templateUrl: 'routes/reports/categories/deleted/reports-categories-deleted.template.html',
          controller: 'ReportsCategoriesDeletedController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

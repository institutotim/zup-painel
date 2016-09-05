angular
  .module('ReportsShowPrintModule', [
    'ReportsShowPrintControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.show.print', {
      url: '/print?sections',
      resolve: {
        'reportResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
          return Restangular.one('reports').one('items', $stateParams.id).get();
        }],

        'feedbackResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
          return Restangular.one('reports', $stateParams.id).one('feedback').get();
        }],

        'commentsResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
          return Restangular.one('reports', $stateParams.id).all('comments').getList();
        }],

        'reportHistoryResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
          return Restangular.one('reports').one('items', $stateParams.id).one('history').getList();
        }],
      },
      views: {
        '@': {
          templateUrl: 'routes/reports/show/print/reports-show-print.template.html',
          controller: 'ReportsShowPrintController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

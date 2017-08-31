angular
  .module('ReportsModule', [
    'ReportsIndexModule',
    'ReportsShowModule',
    'ReportsAddModule',
    'ReportsCategoriesIndexModule',
    'ReportsCategoriesEditModule',
    'ReportsCategoriesDeletedModule',
    'ReportsPhraseologiesIndexModule',
    'ReportsPerimetersIndexModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports', {
      abstract: true,
      url: '/reports',
      templateUrl: 'routes/reports/reports.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

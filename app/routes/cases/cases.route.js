angular
  .module('CasesModule', [
    'CasesIndexModule',
    'CasesEditModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('cases', {
      abstract: true,
      url: '/cases',
      templateUrl: 'routes/cases/cases.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

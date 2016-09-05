angular
  .module('HelpModule', [
    'HelpControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('help', {
      url: '/help',
      templateUrl: 'routes/help/help.template.html',
      controller: 'HelpController',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

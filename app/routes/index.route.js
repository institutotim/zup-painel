angular
  .module('IndexModule', [
    'IndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('home', {
      url: '/',
      template: '',
      resolve: {
        'User': ['User', function(User) {
          return User();
        }]
      },
      controller: 'IndexController'
    });

  }]);

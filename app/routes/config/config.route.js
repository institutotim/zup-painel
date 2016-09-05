angular
  .module('ConfigModule', [
    'ConfigControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('config', {
      url: '/config',
      templateUrl: 'routes/config/config.template.html',
      controller: 'ConfigController',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }],

        'flagsResponse': ['Restangular', function(Restangular) {
          return Restangular.all('feature_flags').getList();
        }]
      }
    });

  }]);

angular
  .module('UsersModule', [
    'UsersIndexModule',
    'UsersShowModule',
    'UsersEditModule',
  ])

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('users', {
      abstract: true,
      url: '/users',
      templateUrl: 'routes/users/users.template.html',
      resolve: {
        'User': ['User', function (User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

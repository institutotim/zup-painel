 angular
  .module('UsersEditModule', [
    'UsersEditControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('users.show.edit', {
      url: '/edit',
      resolve: {
        'Authorize': [
          'Authorization', 'userResponse', 'User',
          function (Authorization, userResponse, User) {
            return Authorization.authorize([
              'users_full_access', 'users_edit'
            ], userResponse.groups, function (isAuthorized, redirectFn) {
              if (!isAuthorized && User.id != userResponse.id) redirectFn();
            });
          }
        ]
      },
      views: {
        '@users': {
          templateUrl: 'routes/users/edit/users-edit.template.html',
          controller: 'UsersEditController',
          controllerAs: 'ctrl',
          resolve: {
            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList();
            }]
          }
        }
      }
    }).state('users.add', {
      url: '/add',
      views: {
        '': {
          templateUrl: 'routes/users/edit/users-edit.template.html',
          controller: 'UsersEditController',
          controllerAs: 'ctrl',
          resolve: {
            'Authorize': ['Authorization', function (Authorization) {
              return Authorization.authorize(['users_full_access', 'users_edit'], null, true);
            }],
            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList();
            }]
          }
        }
      }
    });
  }]);

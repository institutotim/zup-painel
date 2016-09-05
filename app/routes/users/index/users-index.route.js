angular
  .module('UsersIndexModule', [
    'UsersIndexControllerModule',
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('users.list', {
      url: '',
      resolve: {
        'Authorize': ['Authorization', 'User', function (Authorization) {
          return Authorization.authorize(['users_full_access', 'users_edit'], null, true);
        }],
        'groupsResponse': ['Restangular', function(Restangular) {
          return Restangular.all('groups').getList({ 'return_fields': 'id,name' });
        }]
      },
      views: {
        '': {
          templateUrl: 'routes/users/index/users-index.template.html',
          controller: 'UsersIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

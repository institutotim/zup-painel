angular
  .module('GroupsModule', [
    'GroupsIndexModule',
    'GroupsShowModule',
    'GroupsEditModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('groups', {
      abstract: true,
      url: '/groups',
      templateUrl: 'routes/groups/groups.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

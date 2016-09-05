angular
  .module('GroupsEditModule', [
    'GroupsEditControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('groups.show.edit', {
      url: '/edit',
      resolve: {
        'Authorize': [
          'Authorization', '$stateParams', 'User',
          function (Authorization, $stateParams) {
            return Authorization.authorize(
              ['groups_full_access', 'group_edit'],
              $stateParams.id, true
            );
          }
        ]
      },
      views: {
        '@groups': {
          templateUrl: 'routes/groups/edit/groups-edit.template.html',
          controller: 'GroupsEditController',
          controllerAs: 'ctrl',
          resolve: {
            'permissionsResponse': ['FullResponseRestangular', '$stateParams', function(FullResponseRestangular, $stateParams) {
              return FullResponseRestangular.one('groups', $stateParams.id).all('permissions').customGET();
            }],
            'objectsResponse': ['FullResponseRestangular', function(FullResponseRestangular) {
              return FullResponseRestangular.one('utils').all('available_objects').customGET();
            }],
            'groupResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
              return Restangular.one('groups', $stateParams.id).get();
            }]
          }
        }
      }
    });
  }]);

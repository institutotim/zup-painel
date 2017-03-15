/*global angular*/
'use strict';

angular
  .module('ServicesPermissionsModule', [
    'GroupsEditControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('services.show.permissions', {
      url: '/permissions',
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
          '@services': {
            templateUrl: 'routes/groups/edit/groups-edit.template.html',
            controller: 'GroupsEditController',
            controllerAs: 'ctrl',
            resolve: {
              'permissionsResponse': ['FullResponseRestangular', '$stateParams', function (FullResponseRestangular, $stateParams) {
              return FullResponseRestangular.one('groups', $stateParams.id).all('permissions').customGET();
              }],
              'objectsResponse': ['FullResponseRestangular', function (FullResponseRestangular) {
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

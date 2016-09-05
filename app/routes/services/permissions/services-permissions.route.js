/*global angular*/
'use strict';

angular
  .module('ServicesPermissionsModule', [
    'GroupsEditControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider

      .state('services.show.permissions', {
        url: '/permissions',
        resolve: {
          'Authorize': ['Authorization', 'User', function (Authorization, User) {
            return Authorization.authorize(['manage_services'], null, true);
          }]
        },
        views: {
          '@services': {
            templateUrl: 'routes/groups/edit/groups-edit.template.html',
            controller: 'GroupsEditController',
            controllerAs: 'ctrl',
            resolve: {
              'permissionsResponse': ['FullResponseRestangular', '$stateParams', function (FullResponseRestangular, $stateParams) {
                return FullResponseRestangular.all('permissions').one('services', $stateParams.id).customGET();
              }],
              'objectsResponse': ['FullResponseRestangular', function (FullResponseRestangular) {
                return FullResponseRestangular.one('utils').all('available_objects').customGET();
              }]
            }
          }
        }
      });
  }]);

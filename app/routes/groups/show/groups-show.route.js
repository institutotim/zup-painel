/*global angular*/
'use strict';

angular
  .module('GroupsShowModule', [
    'GroupsShowControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('groups.show', {
      url: '/{id:[0-9]*}',
      resolve: {
        'Authorize': ['Authorization', '$stateParams', 'User', function (Authorization, $stateParams) {
          return Authorization.authorize([
            'groups_full_access', 'group_edit', 'group_read_only'
          ], $stateParams.id, true);
        }],
        'Resource': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
          return Restangular
            .one('groups', $stateParams.id)
            .withHttpConfig({treatingErrors: true})
            .get()
            .then(function (response) {
              return response.data;
            });
        }]
      },
      views: {
        '': {
          templateUrl: 'routes/groups/show/groups-show.template.html',
          controller: 'GroupsShowController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

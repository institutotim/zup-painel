/*global angular*/
'use strict';

angular
  .module('ServicesEditModule', [
    'ServicesEditControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider

      .state('services.show.edit', {
        url: '/edit',
        resolve: {
          'Authorize': ['Authorization', 'User', function (Authorization, User) {
            return Authorization.authorize(['manage_services'], null, true);
          }]
        },
        views: {
          '@services': {
            templateUrl: 'routes/services/edit/services-edit.template.html',
            controller: 'ServicesEditController',
            controllerAs: 'ctrl'
          }
        }
      })

      .state('services.add', {
        url: '/add',
        views: {
          '': {
            templateUrl: 'routes/services/edit/services-edit.template.html',
            controller: 'ServicesEditController',
            controllerAs: 'ctrl',
            resolve: {
              'Authorize': ['Authorization', 'User', function (Authorization, User) {
                return Authorization.authorize(['manage_services'], null, true);
              }]
            }
          }
        }
      });
  }]);

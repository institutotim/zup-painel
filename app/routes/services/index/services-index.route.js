/*global angular*/
'use strict';

angular
  .module('ServicesIndexModule', [
    'ServicesIndexControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('services.list', {
      url: '',
      resolve: {
        'Authorize': ['Authorization', 'User', function (Authorization, User) {
          return Authorization.authorize(['manage_services'], null, true);
        }]
      },
      views: {
        '': {
          templateUrl: 'routes/services/index/services-index.template.html',
          controller: 'ServicesIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

/*global angular*/
'use strict';

angular
  .module('ServicesModule', [
    'ServicesIndexModule',
    'ServicesEditModule',
    'ServicesShowModule',
    'ServicesPermissionsModule',
    'GroupsEditModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('services', {
      abstract: true,
      url: '/services',
      templateUrl: 'routes/services/services.template.html',
      resolve: {
        'User': ['User', function (User) {
          return User({permissions: ['isLogged']});
        }]
      }
    });

  }]);

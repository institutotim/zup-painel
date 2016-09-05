/*global angular*/
'use strict';

angular
  .module('ServicesShowControllerModule', [])

  .controller('ServicesShowController', function ($scope, Resource, $modal) {
    $scope.service = Resource;

    $scope.disableService = function (service) {
      $modal.open({
        templateUrl: 'modals/users/disable/services-disable.template.html',
        windowClass: 'removeModal',
        resolve: {
          service: function () {
            return service;
          }
        },
        controller: 'ServicesDisableModalController'
      });
    };
  });

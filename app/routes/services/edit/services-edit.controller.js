/*global angular*/
'use strict';

angular
  .module('ServicesEditControllerModule', [
    'EqualsComponentModule',
    'ServicesServiceModule'
  ])

  .controller('ServicesEditController', function ($scope, $rootScope, $stateParams, $location, ServicesService) {
    var updating = $scope.updating = false;
    var serviceId = $stateParams.id;
    $scope.service = {};
    $scope.isObject = angular.isObject;

    if (typeof serviceId !== 'undefined') {
      updating = true;
      $scope.updating = true;
    }

    $scope.loading = true;

    if (updating) {
      ServicesService.fetch(serviceId).then(function (service) {
        $scope.service = service;
        $scope.loading = false;
      });
    }

    $scope.send = function () {
      $scope.inputErrors = null;
      $scope.processingForm = true;
      $rootScope.resolvingRequest = true;

      var service = angular.copy($scope.service);

      // PUT if updating and POST if creating a new service
      if (updating) {

        var putServicePromise = ServicesService.update(service, {});

        putServicePromise.then(function () {
          $scope.showMessage('ok', 'A aplicação foi atualizada com sucesso', 'success', true);

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        }, function (err) {
          $scope.showMessage('exclamation-sign', 'A aplicação não pode ser salva', 'error', true);

          $scope.inputErrors = err;

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        });
      }
      else {
        var postServicePromise = ServicesService.create(service, {return_fields: 'id'});

        postServicePromise.then(function () {
          $scope.showMessage('ok', 'A aplicação foi criada com sucesso', 'success', true);

          $location.path('/services');

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        }, function (err) {
          $scope.showMessage('exclamation-sign', 'A aplicação não pode ser criada', 'error', true);

          $scope.inputErrors = err;

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        });
      }
    };
  });

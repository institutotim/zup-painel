'use strict';

angular
  .module('ErrorModalControllerModule', [])

  .controller('ErrorModalController', function($scope, $rootScope, $modalInstance, $state, response, Raven, Auth) {
    // we hide any kind of loading
    $rootScope.resolvingRoute = false;
    $rootScope.resolvingRequest = false;

    $scope.response = response;

    Raven.captureMessage(JSON.stringify(response));

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.redoSession = function() {
      Auth.logout();
      $state.go('user.login');

      $modalInstance.close();
    };
  });

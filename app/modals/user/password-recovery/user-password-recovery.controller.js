'use strict';

angular
  .module('UserPasswordRecoverModalControllerModule', [])

  .controller('UserPasswordRecoveryModalController', function(Restangular, $scope, $modalInstance) {
    $scope.user = {email: null};

    $scope.confirm = function() {
      $scope.processingForm = true;

      var passwordRecoverPromise = Restangular.one('recover_password').customPUT({ email: $scope.user.email, panel: true });

      passwordRecoverPromise.then(function() {
        $scope.success = true;
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

angular
  .module('UserLoginControllerModule', [
    'UserPasswordRecoverModalControllerModule'
  ])

  .controller('UserLoginController', function ($scope, $rootScope, $state, Auth, $modal) {
    $scope.login = function () {
      $scope.loginError = false;
      $scope.processingRequest = true;

      Auth.login($scope.email, $scope.password).then(function () {
        $state.go('reports.index.list');
      }, function() {
        $scope.loginError = true;
        $scope.processingRequest = false;
      });

      return false;
    };

    $scope.recoverPassword = function () {
      $modal.open({
        templateUrl: 'modals/user/password-recovery/user-password-recovery.template.html',
        windowClass: 'removeModal',
        controller: 'UserPasswordRecoveryModalController'
      });
    };
  });

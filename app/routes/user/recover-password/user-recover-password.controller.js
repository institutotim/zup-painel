angular
  .module('UserRecoverPasswordControllerModule', ['UsersServiceModule'])
  .controller('UserRecoverPasswordController', function($scope, $rootScope, $state, Auth, $stateParams, UsersService) {
    // Get the resetToken from the URL
    $scope.resetToken = $stateParams.resetToken;
    $scope.newPassword = '';
    $scope.newPasswordConfirmation = '';
    $scope.responseMessage = '';

    $scope.createNewPassword = function() {
      var promise = UsersService.recoverPassword(
        $scope.resetToken, $scope.newPassword, $scope.newPasswordConfirmation
      );

      promise.then(function(response) {
        if (response.data.error) {
          $scope.responseMessage = response.data.message;
        } else {
          $state.go('user.login');
        }
      });

      return promise;
    };
  });

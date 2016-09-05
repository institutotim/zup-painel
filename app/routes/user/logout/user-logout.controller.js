angular
  .module('UserLogoutControllerModule', [])

  .controller('UserLogoutController', function($state, Auth) {
    Auth.logout();
    $state.go('user.login');
  });

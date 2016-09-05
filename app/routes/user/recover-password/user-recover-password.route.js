angular
  .module('UserRecoverPasswordModule', [
    'UserRecoverPasswordControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {
    // Route: /user/password/new/:token
    $stateProvider.state('user.recover-password', {
      url: '/password/new/:resetToken',
      views: {
        '@': {
          templateUrl: 'routes/user/recover-password/user-recover-password.template.html',
          controller: 'UserRecoverPasswordController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

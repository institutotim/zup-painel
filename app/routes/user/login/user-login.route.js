angular
  .module('UserLoginModule', [
    'UserLoginControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    // /user/login
    $stateProvider.state('user.login', {
      url: '/login',
      views: {
        '@': {
          templateUrl: 'routes/user/login/user-login.template.html',
          controller: 'UserLoginController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

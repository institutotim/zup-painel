angular
  .module('UserLogoutModule', [
    'UserLogoutControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    // /user/logout
    $stateProvider.state('user.logout', {
      url: '/logout',
      views: {
        '@': {
          template: '',
          controller: 'UserLogoutController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

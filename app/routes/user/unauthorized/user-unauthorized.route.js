angular
  .module('UserUnauthorizedModule', [
    'UserUnauthorizedControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    // /user/login
    $stateProvider.state('user.unauthorized', {
      url: '/unauthorized',
      views: {
        '@': {
          templateUrl: 'routes/user/unauthorized/user-unauthorized.template.html',
          controller: 'UserUnauthorizedController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

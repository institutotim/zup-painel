angular
  .module('ServicesShowModule', [
    'ServicesShowControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider

      .state('services.show', {
        url: '/{id:[0-9]*}',
        resolve: {
          'Authorize': ['Authorization', 'User', function (Authorization, User) {
            return Authorization.authorize(['manage_services'], null, true);
          }],
          'Resource': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
            return Restangular
              .one('services', $stateParams.id)
              .withHttpConfig({treatingErrors: true})
              .get()
              .then(function (response) {
                return response.data;
              });
          }]
        },
        views: {
          '': {
            templateUrl: 'routes/services/show/services-show.template.html',
            controller: 'ServicesShowController',
            controllerAs: 'ctrl'
          }
        }
      });
  }]);

angular
  .module('FlowsModule', [
    'FlowsIndexModule',
    'FlowsShowModule',
    'FlowsShowStepsEditModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('flows', {
      abstract: true,
      url: '/flows',
      templateUrl: 'routes/flows/flows.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

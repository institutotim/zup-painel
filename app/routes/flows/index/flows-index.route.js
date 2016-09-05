angular
  .module('FlowsIndexModule', [
    'FlowsIndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('flows.list', {
      url: '',

      views: {
        '': {
          templateUrl: 'routes/flows/index/flows-index.template.html',
          controller: 'FlowsIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

angular
  .module('FlowsShowModule', [
    'FlowsShowControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('flows.show', {
      url: '/{id:[0-9]{1,4}}',
      views: {
        '': {
          templateUrl: 'routes/flows/show/flows-show.template.html',
          controller: 'FlowsShowController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

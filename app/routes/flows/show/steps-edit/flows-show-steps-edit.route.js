angular
  .module('FlowsShowStepsEditModule', [
    'FlowsShowStepsEditControllerModule',
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('flows.show.steps-edit', {
      url: '/version/{versionId:[0-9]{1,4}|draft}/steps/{stepId:[0-9]{1,4}}/edit',
      views: {
        '@': {
          templateUrl: 'routes/flows/show/steps-edit/flows-show-steps-edit.template.html',
          controller: 'FlowsShowStepsEditController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);

angular
  .module('CasesEditModule', [
    'CasesEditControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('cases.edit', {
      url: '/{id:[0-9]{1,4}}',
      views: {
        '@': {
          templateUrl: 'routes/cases/edit/cases-edit.template.html',
          controller: 'CasesEditController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

angular
  .module('CasesIndexModule', [
    'CasesIndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('cases.list', {
      url: '',

      views: {
        '': {
          templateUrl: 'routes/cases/index/cases-index.template.html',
          controller: 'CasesIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

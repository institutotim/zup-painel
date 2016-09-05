angular
  .module('ItemsIndexModule', [
    'ItemsIndexControllerModule',
    'ItemsIndexMapModule',
    'StyleResultsTableComponentModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items.list', {
      url: '',

      views: {
        '': {
          templateUrl: 'routes/items/index/items-index.template.html',
          controller: 'ItemsIndexController',
          controllerAs: 'ctrl',
          resolve: {
            'isMap': function() {
              return false;
            }
          }
        }
      }
    });

  }]);

angular
  .module('ItemsIndexMapModule', [
    'StyleMapComponentModule',
    'MapComponentModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items.list.map', {
      url: '/map',

      views: {
        '@items': {
          templateUrl: 'routes/items/index/map/items-index-map.template.html',
          controller: 'ItemsIndexController',
          controllerAs: 'ctrl',
          resolve: {
            'isMap': function() {
              return true;
            }
          }
        }
      }
    });

  }]);

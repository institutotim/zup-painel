angular
  .module('ItemsModule', [
    'ItemsIndexModule',
    'ItemsShowModule',
    'ItemsEditModule',
    'ItemsSelectCategoryModule',
    'ItemsCategoriesIndexModule',
    'ItemsCategoriesEditModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items', {
      abstract: true,
      url: '/items',
      templateUrl: 'routes/items/items.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

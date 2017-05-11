angular
  .module('ItemsCategoriesDeletedModule', [
    'ItemsCategoriesDeletedControllerModule',
    'InventoriesCategoriesServiceModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    // TODO: Understand why this needs to be with `_` and not
    // reports.categories.deleted
    $stateProvider.state('items.categories_deleted', {
      url: '/categories/deleted',
      cache: false,
      views: {
        '': {
          templateUrl: 'routes/items/categories/deleted/items-categories-deleted.template.html',
          controller: 'ItemsCategoriesDeletedController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

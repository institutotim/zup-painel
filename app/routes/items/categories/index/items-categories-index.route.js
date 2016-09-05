angular
  .module('ItemsCategoriesIndexModule', [
    'ItemsCategoriesIndexControllerModule',
    'InventoriesCategoriesServiceModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items.categories', {
      url: '/categories',

      views: {
        '': {
          templateUrl: 'routes/items/categories/index/items-categories-index.template.html',
          controller: 'ItemsCategoriesIndexController',
          controllerAs: 'ctrl',
          resolve: {
            'categoriesResponse': ['InventoriesCategoriesService', '$q', function(InventoriesCategoriesService, $q) {
              var fetchAllBasicInfo = function() {
                var deferred = $q.defer();

                InventoriesCategoriesService.fetchAllBasicInfo().then(function(response) {
                  deferred.resolve(response.data.categories);
                });

                return deferred.promise;
              };

              return InventoriesCategoriesService.loadedBasicInfo ? _.values(InventoriesCategoriesService.categories) : fetchAllBasicInfo();
            }]
          }
        }
      }
    });

  }]);

angular
  .module('ItemsSelectCategoryModule', [
    'ItemsSelectCategoryControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items.select-category', {
      url: '/select-category',
      views: {
        '@': {
          templateUrl: 'routes/items/select-category/items-select-category.template.html',
          controller: 'ItemsSelectCategoryController',
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

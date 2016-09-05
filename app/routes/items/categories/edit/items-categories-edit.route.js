angular
  .module('ItemsCategoriesEditModule', [
    'ItemsCategoriesEditControllerModule',
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('items.categories.edit', {
      url: '/{id:[0-9]{1,4}}/edit',

      views: {
        '@': {
          templateUrl: 'routes/items/categories/edit/items-categories-edit.template.html',
          controller: 'ItemsCategoriesEditController',
          controllerAs: 'ctrl',
          resolve: {
            'categoryResponse': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
              return Restangular.one('inventory').one('categories', $stateParams.id).get({display_type: 'full'});
            }],

            'analyzesResponse': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
              return Restangular.one('inventory').one('categories', $stateParams.id).all('analyzes').getList();
            }],

            'formulasResponse': ['FullResponseRestangular', '$stateParams', '$q', '$log', '$rootScope', function(FullResponseRestangular, $stateParams, $q, $log, $rootScope) {
              var defer = $q.defer();

              if($rootScope.hasPermission('inventories_formulas_full_access')){
                var triggersPromise = FullResponseRestangular.one('inventory').one('categories', $stateParams.id).all('formulas').customGET();
                triggersPromise.then(function(response) {
                  defer.resolve(response);
                }, function() {
                  defer.resolve(false);
                });
              }else{
                $log.info('Sem permissão de edição de fórmulas.');
                defer.resolve(true);
              }


              return defer.promise;
            }],

            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList({ignore_namespaces: true, return_fields: 'id,name,namespace'});
            }]
          }
        }
      }
    }).state('items.categories.add', {
      url: '/add',

      views: {
        '@': {
          templateUrl: 'routes/items/categories/edit/items-categories-edit.template.html',
          controller: 'ItemsCategoriesEditController',
          controllerAs: 'ctrl',
          resolve: {
            'categoryResponse': function() {
              return false;
            },

            'formulasResponse': function() {
              return false;
            },

            'analyzesResponse': function() {
              return false;
            },

            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList();
            }]
          }
        }
      }
    });

  }]);

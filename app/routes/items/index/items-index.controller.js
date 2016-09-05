'use strict';

angular
  .module('ItemsIndexControllerModule', [
    'AdvancedFiltersServiceModule',
    'InventoriesItemsServiceModule',
    'ItemsDestroyModalControllerModule',
    'angular-toArrayFilter'
  ])

  .controller('ItemsIndexController', function ($state, $scope, $rootScope, $modal, $q, isMap, AdvancedFilters, $location, $window, $cookies, InventoriesItemsService, $log) {

    $log.info('ItemsIndexController created.');
    $scope.loading = true;
    $rootScope.uiHasScroll = true;

    var page = 1, perPage = 15;

    $scope.loadingPagination = false;
    $scope.filtersHash = null;
    $scope.categories = {};
    $scope.categoriesStatuses = {};
    $scope.total = 0;
    // Basic filters
    var resetFilters = function() {
      $scope.selectedCategories = [];
      $scope.selectedStatuses = [];
      $scope.selectedUsers = [];
      $scope.beginDate = null;
      $scope.endDate = null;
      $scope.searchText = null;
      $scope.fields = [];

      // map options
      $scope.position = null;
      $scope.selectedAreas = [];
      $scope.zoom = null;
      $scope.clusterize = null;
    };

    resetFilters();

    // sorting the tables
    $scope.sort = {
      column: 'created_at',
      descending: true
    };

    $scope.changeSorting = function(column) {
      var sort = $scope.sort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      InventoriesItemsService.resetCache();
      $scope.reload();
    };

    $scope.selectedCls = function (column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    $scope.availableFilters = [
      {name: 'Protocolo ou endereço contém...', action: 'query'},
      {name: 'Com as categorias...', action: 'category'},
      {name: 'Com os estados...', action: 'status'},
      {name: 'Por criador do item...', action: 'author'},
      {name: 'Por período...', action: 'date'},
      {name: 'Por perímetro...', action: 'area'},
      {name: 'Por campos...', action: 'fields'}
    ];

    $scope.activeAdvancedFilters = [];

    if (typeof $cookies.inventoryFiltersHash !== 'undefined')
    {
      $scope.activeAdvancedFilters = JSON.parse($window.atob($cookies.inventoryFiltersHash));
    }

    if (typeof $location.search().filters !== 'undefined')
    {
      $scope.filtersHash = $location.search().filters;
      $scope.activeAdvancedFilters = JSON.parse($window.atob($scope.filtersHash));
    }

    $scope.$watch('activeAdvancedFilters', function() {
      resetFilters();

      // save filters into hash
      if ($scope.activeAdvancedFilters.length !== 0)
      {
        $scope.filtersHash = $window.btoa(JSON.stringify($scope.activeAdvancedFilters));

        $location.search('filters', $scope.filtersHash);

        $cookies.inventoryFiltersHash = $scope.filtersHash;
      }
      else
      {
        $scope.filtersHash = null;

        $location.search('filters', null);

        delete $cookies.inventoryFiltersHash;
      }

      for (var i = $scope.activeAdvancedFilters.length - 1; i >= 0; i--) {
        var filter = $scope.activeAdvancedFilters[i];

        if (filter.type === 'query')
        {
          $scope.searchText = filter.value;
        }

        if (filter.type === 'categories')
        {
          $scope.selectedCategories.push(filter.value);
        }

        if (filter.type === 'statuses')
        {
          $scope.selectedStatuses.push(filter.value);
        }

        if (filter.type === 'authors')
        {
          $scope.selectedUsers.push(filter.value);
        }

        if (filter.type === 'fields')
        {
          $scope.fields.push(filter.value);
        }

        if (filter.type === 'beginDate')
        {
          $scope.beginDate = filter.value;
        }

        if (filter.type === 'endDate')
        {
          $scope.endDate = filter.value;
        }

        if (filter.type === 'area')
        {
          $scope.selectedAreas.push(filter.value);
        }
      }

      loadFilters();
    }, true);

    // Return right promise
    $scope.generateItemsFetchingOptions = function() {
      var options = { appendItems: true };

      if (!$scope.position)
      {
        options.page = page;
        options.per_page = perPage;
      }

      // if we searching, hit search/users
      if ($scope.searchText !== null)
      {
        options.query = $scope.searchText;
      }

      // check if we have categories selected
      if ($scope.selectedCategories.length !== 0)
      {
        options.inventory_categories_ids = $scope.selectedCategories.join(); // jshint ignore:line
      }

      // check if we have statuses selected
      if ($scope.selectedStatuses.length !== 0)
      {
        options.inventory_statuses_ids = $scope.selectedStatuses.join(); // jshint ignore:line
      }

      // check if we have statuses selected
      if ($scope.selectedUsers.length !== 0)
      {
        options.users_ids = $scope.selectedUsers.join(); // jshint ignore:line
      }

      if ($scope.beginDate !== null)
      {
        options['created_at[begin]'] = $scope.beginDate;
      }

      if ($scope.endDate !== null)
      {
        options['created_at[end]'] = $scope.endDate;
      }

      if ($scope.sort.column !== '')
      {
        options.sort = $scope.sort.column;
        options.order = $scope.sort.descending ? 'desc' : 'asc';
      }

      // fields
      if ($scope.fields.length !== 0)
      {
        console.log($scope.fields);
        for (var i = $scope.fields.length - 1; i >= 0; i--) {
          var key = 'fields[' + $scope.fields[i].id + '][' + $scope.fields[i].condition + ']';

          if (_.isArray($scope.fields[i].value))
          {
            for (var j = $scope.fields[i].value.length - 1; j >= 0; j--) {
              var tempKey = key + '[' + j + ']';

              options[tempKey] = $scope.fields[i].value[j];
            }
          }
          else
          {
            options[key] = $scope.fields[i].value;
          }
        }
      }

      // map options
      if ($scope.selectedAreas.length === 0 && $scope.position !== null)
      {
        options['position[latitude]'] = $scope.position.latitude;
        options['position[longitude]'] = $scope.position.longitude;
        options['position[distance]'] = $scope.position.distance;
      }
      else if ($scope.selectedAreas.length !== 0)
      {
        for (var z = $scope.selectedAreas.length - 1; z >= 0; z--) {
          var latKey = 'position[' + z + '][latitude]';
          var lngKey = 'position[' + z + '][longitude]';
          var disKey = 'position[' + z + '][distance]';

          options[latKey] = $scope.selectedAreas[z].latitude;
          options[lngKey] = $scope.selectedAreas[z].longitude;
          options[disKey] = $scope.selectedAreas[z].distance;
        }
      }

      if ($scope.zoom !== null)
      {
        options.zoom = $scope.zoom;
      }

      if ($scope.clusterize !== null)
      {
        options.clusterize = true;
      }

      return options;
    };

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function(paginate, mapOptions) {
      if ($scope.loadingPagination === false)
      {
        $scope.loadingPagination = true;

        if (typeof mapOptions !== 'undefined')
        {
          $scope.position = mapOptions.position;
          $scope.zoom = mapOptions.zoom;
          $scope.clusterize = mapOptions.clusterize;
        }

        var promise = InventoriesItemsService.fetchAll($scope.generateItemsFetchingOptions());

        promise.then(function (items) {
          page++;
          $scope.items = items;

          $scope.total = InventoriesItemsService.total;

          var lastPage = Math.ceil($scope.total / perPage);

          if (page === (lastPage + 1))
          {
            $scope.loadingPagination = null;
          }
          else
          {
            $scope.loadingPagination = false;
          }

          $scope.loading = false;
        });

        return promise;
      }
    };

    $scope.$on('inventoriesItemsFetching', function(){
      if(isMap)
      {
        $scope.loading = true;
      }
    });

    $scope.$on('inventoriesItemsFetched', function(){
      $scope.total = InventoriesItemsService.total;
      $scope.loading = false;
    });

    var loadFilters = $scope.reload = function(reloading) {
      if (!isMap)
      {
        // reset pagination
        InventoriesItemsService.resetCache();
        page = 1;
        $scope.loadingPagination = false;

        if (reloading === true)
        {
          $scope.reloading = true;
        }

        $scope.loadingContent = true;
        $scope.items = [];

        getData().then(function(items) {
          $scope.loadingContent = false;
          $scope.items = items;

          if (reloading === true)
          {
            $scope.reloading = false;
          }
        });
      }
      else
      {
        $scope.$broadcast('mapRefreshRequested', true);
      }
    };

    $scope.reloadMap = function(){
      $rootScope.$emit('mapRefreshRequested');
    };

    $scope.removeFilter = function(filter) {
      $scope.activeAdvancedFilters.splice($scope.activeAdvancedFilters.indexOf(filter), 1);
    };

    $scope.resetFilters = function() {
      $scope.activeAdvancedFilters = [];

      if (isMap) $scope.$broadcast('updateMap', true);
    };

    $scope.loadFilter = function(status) {
      if (status === 'query')
      {
        AdvancedFilters.query($scope.activeAdvancedFilters);
      }

      if (status === 'category')
      {
        AdvancedFilters.category($scope.activeAdvancedFilters, 'items');
      }

      if (status === 'status')
      {
        AdvancedFilters.status($scope.activeAdvancedFilters, 'items');
      }

      if (status === 'author')
      {
        AdvancedFilters.author($scope.activeAdvancedFilters);
      }

      if (status === 'fields')
      {
        AdvancedFilters.fields($scope.activeAdvancedFilters, 'items');
      }

      if (status === 'date')
      {
        AdvancedFilters.period($scope.activeAdvancedFilters);
      }

      if (status === 'area')
      {
        AdvancedFilters.area($scope.activeAdvancedFilters);
      }
    };

    // Search function
    $scope.search = function(text) {
      $scope.searchText = text;

      loadFilters();
    };

    $scope.share = function () {
      AdvancedFilters.share();
    };

    $scope.changeToMap = function() {
      if ($scope.filtersHash !== null)
      {
        $location.url('/inventories/map?filters=' + $scope.filtersHash);
      }
      else
      {
        $location.url('/inventories/map');
      }
    };

    $scope.changeToList = function() {
      if ($scope.filtersHash !== null)
      {
        $location.url('/inventories?filters=' + $scope.filtersHash);
      }
      else
      {
        $location.url('/inventories');
      }
    };

    $scope.deleteItem = function (item, category) {
      $modal.open({
        templateUrl: 'modals/items/destroy/items-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          item: function() {
            return item;
          },

          category: function() {
            return category;
          }
        },
        controller: 'ItemsDestroyModalController'
      });
    };

    $scope.export = function() {
      $modal.open({
        templateUrl: 'views/inventories/export.html',
        windowClass: 'filterCategoriesModal',
        resolve: {
          categories: function() {
            return $scope.categories;
          }
        },
        controller: ['$scope', '$modalInstance', 'categories', function($scope, $modalInstance, categories) {
          $scope.categories = categories;

          $scope.updateCategory = function(category) {
            var i = $scope.categories.indexOf(category);

            if ($scope.categories[i].selected === true)
            {
              $scope.categories[i].selected = false;
            }
            else
            {
              $scope.categories[i].selected = true;
            }
          };

          $scope.close = function() {
            $modalInstance.close();
          };
        }]
      });
    };

    $scope.openItem = function(item, event) {
      if(!$rootScope.loading
        && event.target.parentNode.tagName.toLowerCase() != 'a'
        && event.target.tagName.toLowerCase() != 'a'
      ) {
        $state.go('items.show', { id: item.id });
      }
    };

    // we hide/show map debug
    $rootScope.pageHasMap = isMap;

    $scope.$on('$destroy', function() {
      $rootScope.pageHasMap = false;
      $log.info('ItemsIndexController destroyed.');
    });

    $scope.canUserEditItems = $scope.hasPermission('inventories_full_access') ||
                              $scope.hasPermission('inventories_categories_edit') ||
                              $scope.hasPermission('inventories_items_edit') ||
                              $scope.hasPermission('inventories_items_delete');
  });

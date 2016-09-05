'use strict';

angular
  .module('ItemsShowControllerModule', [
    'MapShowItemComponentModule',
    'MapViewStreetviewComponentModule',
    'FieldHistoryModalControllerModule',
    'GalleryComponentModule'
  ])

  .controller('ItemsShowController', function ($rootScope, $scope, Restangular, $q, $state, $modal, itemResponse, $log, CasesService, ReturnFieldsService) {
    $log.info('ItemsShowController created.');
    $scope.$on('$destroy', function(){
      $log.info('ItemsShowController destroyed.')
    });
    $scope.item = itemResponse;
    $scope.category = $scope.item.category;
    $scope.show_status_bar = $scope.category.statuses && $scope.category.statuses.length > 0;
    $scope.item_status = null;

    // Normalize returned cases
    if ($scope.item.related_entities.cases) {
      $scope.item.related_entities.cases = _.map($scope.item.related_entities.cases, function(kase) {
        return CasesService.denormalizeCase(kase);
      });
    }

    $scope.openRelatedCase = function(kase){
      $state.go('cases.edit', { id: kase.id });
    };

    $scope.openRelatedReport = function(report){
      $state.go('reports.show', { id: report.id });
    };

    $scope.updateItemStatus = function(){
      if($scope.item.inventory_status_id != null){
        var statuses = $scope.category.statuses;
        for(var i = 0; i < statuses.length; i++){
          if($scope.item.inventory_status_id === statuses[i].id){
            $scope.item_status = statuses[i];
            break;
          }
        }
      }else{
        $scope.item_status = {color: '#271129', title: 'Não definido'};
      }
    };

    $scope.updateItemStatus();

    $scope.getDataByInventoryFieldId = function(id) {
      for (var i = $scope.item.data.length - 1; i >= 0; i--) {
        if (typeof $scope.item.data[i].field !== 'undefined' && $scope.item.data[i].field !== null && $scope.item.data[i].field.id === parseInt(id)) // jshint ignore:line
        {
          return $scope.item.data[i].content;
        }
      }

      return null;
    };

    $scope.getSelectedOptionsByFieldId = function(id) {
      for (var i = $scope.item.data.length - 1; i >= 0; i--) {
        if (typeof $scope.item.data[i].field !== 'undefined' && $scope.item.data[i].field !== null && $scope.item.data[i].field.id === parseInt(id)) // jshint ignore:line
        {
          return $scope.item.data[i].selected_options;
        }
      }

      return null;
    };

    // TODO: Make this as a component
    $scope.editItemStatus = function (item, category) {
      $modal.open({
        templateUrl: 'modals/items/edit-status/items-edit-status.template.html',
        windowClass: 'editStatusModal',
        resolve: {
          item: function() {
            return item;
          },

          category: function() {
            return category;
          },

          refreshItemHistory: function() {
            return $scope.refreshHistory;
          },

          updateItemStatus: function() {
            return $scope.updateItemStatus;
          }
        },
        controller: ['$scope', '$modalInstance', 'category', 'item', 'refreshItemHistory', 'updateItemStatus', function($scope, $modalInstance, category, item, refreshItemHistory, updateItemStatus) {
          $scope.category = category;
          $scope.item = angular.copy(item);

          $scope.changeStatus = function(statusId) {
            $scope.item.inventory_status_id = statusId; // jshint ignore:line
          };

          $scope.save = function() {
            var itemsReturnFields = [
              'id', 'address', 'inventory_category_id', 'inventory_category_id',
              'inventory_status_id', 'position', 'title', {
                'data': [
                  'id', 'content', 'selected_options',
                  {
                    field: ['id']
                  }
                ],
                'related_entities': [{
                  'report_items': [
                    'id', 'created_at', 'updated_at',
                    {
                      'category': ['title'],
                      'status': ['title']
                    }
                  ],
                  'cases': [
                    'id', 'created_at', 'updated_at', 'status',
                    {
                      'initial_flow': ['title']
                    }
                  ]
                }]
              }
            ];

            var changeStatusPromise = Restangular.all('inventory').one('categories', $scope.category.id)
              .one('items', $scope.item.id)
              .customPUT({ 'inventory_status_id': $scope.item.inventory_status_id, 'return_fields': ReturnFieldsService.convertToString(itemsReturnFields) }); // jshint ignore:line

            changeStatusPromise.then(function() {
              item.inventory_status_id = $scope.item.inventory_status_id; // jshint ignore:line

              refreshItemHistory();

              updateItemStatus();

              $modalInstance.close();
            });
          };

          $scope.close = function() {
            $modalInstance.close();
          };
        }]
      });
    };

    $scope.deleteItem = function (item, category) {
      $modal.open({
        templateUrl: 'modals/items/destroy/items-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          removeItemFromList: function() {
            return false;
          },

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

    // TODO: Component should me ItemsFieldHistoryModalController
    $scope.showFieldHistory = function(field) {
      $rootScope.resolvingRequest = true;

      $modal.open({
        templateUrl: 'modals/items/field-history/items-field-history.template.html',
        windowClass: 'field-history-modal',
        resolve: {
          field: function() {
            return field;
          },

          itemId: function() {
            return $scope.item.id;
          },

          'itemHistoryResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
            return Restangular.one('inventory').one('items', $scope.item.id).one('history').getList(null, { object_id: field.id });
          }]
        },
        controller: 'FieldHistoryModalController'
      });
    };

    // item history
    $scope.refreshHistory = function() {
      var options = { 'return_fields': 'id,action,created_at,kind,objects.id,objects.label,objects.title,objects.name,user.name,user.id' }, selectedFilters = $scope.selectedFilters();

      if (selectedFilters.length !== 0) options.kind = selectedFilters.join();

      if ($scope.historyFilterBeginDate) options['created_at[begin]'] = $scope.historyFilterBeginDate;
      if ($scope.historyFilterEndDate) options['created_at[end]'] = $scope.historyFilterEndDate;

      $scope.loadingHistoryLogs = true;

      var historyPromise = Restangular.one('inventory').one('items', $scope.item.id).one('history').getList(null, options);

      historyPromise.then(function(historyLogs) {
        $scope.historyLogs = historyLogs.data;

        $scope.loadingHistoryLogs = false;
      });
    };

    $scope.historyOptions = { type: undefined };
    $scope.availableHistoryFilters = [
      { type: 'report', name: 'Relatos', selected: false },
      { type: 'fields', name: 'Campos', selected: false },
      { type: 'images', name: 'Imagens', selected: false },
      { type: 'flow', name: 'Fluxo', selected: false },
      { type: 'formula', name: 'Fórmulas', selected: false },
      { type: 'status', name: 'Estados', selected: false }
    ];

    $scope.availableHistoryDateFilters = [
      { name: 'Hoje', beginDate: moment().startOf('day').format(), endDate: moment().endOf('day').format(), selected: false },
      { name: 'Ontem', beginDate: moment().subtract(1, 'days').startOf('day').format(), endDate: moment().subtract(1, 'days').endOf('day').format(), selected: false },
      { name: 'Este mês', beginDate: moment().startOf('month').format(), endDate: moment().subtract(1, 'days').endOf('day').format(), selected: false },
      { name: 'Mês passado', beginDate: moment().subtract(1, 'months').startOf('month').format(), endDate: moment().subtract(1, 'months').subtract(1, 'days').endOf('day').format(), selected: false },
      { name: 'Todos', beginDate: null, endDate: null, selected: true }
    ];

    $scope.selectedFilters = function() {
      var filters = [];

      _.each($scope.availableHistoryFilters, function(filter) {
        if (filter.selected) filters.push(filter.type);
      });

      return filters;
    };

    $scope.toggleOption = function(option) {
      option.selected = !option.selected;

      $scope.refreshHistory();
    };

    $scope.resetHistoryFilters = function() {
      _.each($scope.availableHistoryFilters, function(filter) {
        filter.selected = true;
      });

      $scope.refreshHistory();
    };

    $scope.showCustomDateFields = function() {
      _.each($scope.availableHistoryDateFilters, function(filter) {
        filter.selected = false;
      });

      $scope.showCustomDateHelper = true;
    };

    $scope.selectDateFilter = function(filter) {
      _.each($scope.availableHistoryDateFilters, function(filter) {
        filter.selected = false;
      });

      filter.selected = !filter.selected;

      $scope.historyFilterBeginDate = filter.beginDate;
      $scope.historyFilterEndDate = filter.endDate;

      $scope.showCustomDateHelper = false;

      $scope.refreshHistory();
    };

    $scope.historyLogs = [];

    $scope.refreshHistory();

    function getCategoryFieldIds(category) {
      return _.flatten(_.map(category.sections, function(section){
        return _.pluck(section.fields, 'id');
      }));
    }

    $scope.userCanEditItem = $scope.hasPermission('inventories_full_access') ||
                         $scope.hasPermission('inventories_categories_edit', $scope.item.category.id) ||
                         $scope.hasPermission('inventories_items_edit', $scope.item.category.id) ||
                         $scope.hasPermission('inventory_fields_can_edit', getCategoryFieldIds($scope.item.category));

  });

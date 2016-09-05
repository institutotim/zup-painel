'use strict';

angular
  .module('FlowsIndexControllerModule', [
    'FlowsAddModalControllerModule',
    'FlowsEditModalControllerModule',
    'FlowsDestroyModalControllerModule',
    'FlowsServiceModule'
  ])

  .controller('FlowsIndexController', function ($scope, $modal, $timeout, FlowsService) {
    var page = 1, per_page = 30;

    $scope.flows = [];
    $scope.searchQuery = '';

    $scope.sortTable = {
      column: 'created_at',
      descending: true
    };

    var getFlows = function () {
      var options = {
        page: page,
        per_page: per_page,
        initial: true
      };

      if ($scope.searchQuery !== '') {
        options.query = $scope.searchQuery;
      }

      if ($scope.sortTable) {
        options.sort = $scope.sortTable.column;
        options.order = $scope.sortTable.descending ? 'desc' : 'asc';
      }

      var promise = FlowsService.fetchAll(options);
      return promise.then(function (flows) {
        if (flows.length > 0) {
          $scope.flows = $scope.flows.concat(flows);
          page++;
        }
      });
    };

    var searchTimeout;
    $scope.$watch('searchQuery', function(oldValue, newValue) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }

      searchTimeout = $timeout(function () {
        if (angular.equals(newValue, oldValue) === false) {
          $scope.reload();
        }
      }, 1000);
    });

    $scope.changeSorting = function (column) {
      var sort = $scope.sortTable;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      $scope.reload();
    };

    $scope.selectedCls = function (column) {
      var sort = $scope.sortTable;
      return column === sort.column && 'sort-' + sort.descending;
    };

    $scope.loadFlows = function () {
      $scope.loadingPagination = true;
      getFlows().then(function () {
        $scope.loadingPagination = false;
      });
    };

    $scope.reload = function () {
      $scope.flows = [];
      page = 1;

      $scope.loadFlows();
    };

    $scope.addFlow = function () {
      $modal.open({
        templateUrl: 'modals/flows/add/flows-add.template.html',
        windowClass: 'addFlowModal',
        resolve: {
          flows: function() {
            return $scope.flows;
          }
        },
        controller: 'FlowsAddModalController'
      });
    };

    $scope.editFlow = function (flow) {
      $modal.open({
        templateUrl: 'modals/flows/edit/flows-edit.template.html',
        windowClass: 'addFlowModal',
        resolve: {
          flows: function() {
            return $scope.flows;
          },

          flow: function() {
            return flow;
          }
        },
        controller: 'FlowsEditModalController'
      });
    };

    $scope.removeFlow = function (flow) {
      $modal.open({
        templateUrl: 'modals/flows/destroy/flows-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          flows: function() {
            return $scope.flows;
          },

          flow: function() {
            return flow;
          }
        },
        controller: 'FlowsDestroyModalController'
      });
    };
  });

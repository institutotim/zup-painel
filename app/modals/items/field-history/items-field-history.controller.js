'use strict';

angular
  .module('FieldHistoryModalControllerModule', [])

  .controller('FieldHistoryModalController', function($rootScope, $scope, $modalInstance, Restangular, itemHistoryResponse, itemId, field) {
    var processLogs = function(historyLogs) {
      var logs = [];

      for (var i = 0; i < historyLogs.length; i++) {
        var newObj = {}, f = historyLogs[i];

        newObj.user = f.user;
        newObj.created_at = f.created_at;

        newObj.changes = _.filter(f.fields_changes, function(obj) {
          return obj.field.id == field.id;
        })[0];

        logs.push(newObj);
      };

      return logs;
    }

    $scope.historyLogs = processLogs(itemHistoryResponse.data);
    $scope.field = field;
    $rootScope.resolvingRequest = false;
    $scope.isArray = _.isArray;

    // item history
    $scope.refreshHistory = function() {
      var options = { object_id: field.id };

      if ($scope.historyFilterBeginDate) options['created_at[begin]'] = $scope.historyFilterBeginDate;
      if ($scope.historyFilterEndDate) options['created_at[end]'] = $scope.historyFilterEndDate;

      $scope.loadingHistoryLogs = true;

      var historyPromise = Restangular.one('inventory').one('items', itemId).one('history').getList(null, options);

      historyPromise.then(function(historyLogs) {
        $scope.historyLogs = processLogs(historyLogs.data);

        $scope.loadingHistoryLogs = false;
      });
    };

    $scope.availableHistoryDateFilters = [
      { name: 'Hoje', beginDate: moment().startOf('day').format(), endDate: moment().endOf('day').format(), selected: false },
      { name: 'Ontem', beginDate: moment().subtract(1, 'days').startOf('day').format(), endDate: moment().subtract(1, 'days').endOf('day').format(), selected: false },
      { name: 'Este mês', beginDate: moment().startOf('month').format(), endDate: moment().endOf('day').format(), selected: false },
      { name: 'Mês passado', beginDate: moment().subtract(1, 'months').startOf('month').format(), endDate: moment().subtract(1, 'months').subtract(1, 'days').endOf('day').format(), selected: false },
      { name: 'Todos', beginDate: null, endDate: null, selected: true }
    ];

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

    $scope.close = function() {
      $modalInstance.close();
    };
  });

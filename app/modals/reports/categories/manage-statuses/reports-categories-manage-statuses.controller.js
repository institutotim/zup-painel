'use strict';

angular
  .module('ReportsCategoriesManageStatusesModalControllerModule', [
    'ReportStatusComponentModule',
    'FlowsServiceModule'
  ])

  .controller('ReportsCategoriesManageStatusesModalController', function ($scope, $modalInstance, category, updating, categoryId, Restangular, FlowsService) {
    $scope.category = category;
    $scope.newStatus = {};
    $scope.updating = updating;
    $scope.categoryId = categoryId;
    $scope.updateStatuses = {};
    Restangular.all('groups').getList({'return_fields': 'id,name'}).then(function(response){
      $scope.groups = response.data;
    });

    $scope.availableColors = ['#59B1DF', '#7DDCE2', '#64D2AF', '#5CB466', '#99C450', '#EACD31', '#F3AC2E', '#F18058', '#EF4D3E', '#E984FC', '#A37FE1', '#7A7AF2'];

    $scope.createStatus = function () {
      if ($scope.newStatus.title !== '') {
        var newStatus = {
          title: $scope.newStatus.title,
          color: '#FFFFFF',
          initial: 'false',
          final: 'false',
          active: 'true',
          private: 'false'
        };

        if (updating) {
          var newStatusPromise = Restangular.one('reports').one('categories', categoryId).post('statuses', newStatus);

          newStatusPromise.then(function (response) {
            $scope.category.statuses.push(Restangular.stripRestangular(response.data));

            $scope.newStatus.title = '';
          });
        }
        else {
          $scope.category.statuses.push(newStatus);

          $scope.newStatus.title = '';
        }
      }
    };

    $scope.changeInitial = function (status) {
      for (var i = $scope.category.statuses.length - 1; i >= 0; i--) {
        if (status !== $scope.category.statuses[i]) {
          $scope.category.statuses[i].initial = false;
        }
      }

      // force change if user clicks on same checkbox
      status.initial = true;
    };

    $scope.removeStatus = function (status) {
      if (typeof status.id !== 'undefined') {
        var deletePromise = Restangular.one('reports').one('categories', categoryId).one('statuses', status.id).remove();

        deletePromise.then(function () {
          $scope.category.statuses.splice($scope.category.statuses.indexOf(status), 1);
        });
      }
      else {
        $scope.category.statuses.splice($scope.category.statuses.indexOf(status), 1);
      }
    };

    $scope.close = function () {
      if (updating) {
        for (var x in $scope.updateStatuses) {
          // change category.statuses to acceptable format for the API
          var tempStatus = angular.copy($scope.updateStatuses[x]);

          tempStatus.initial = tempStatus.initial.toString();
          tempStatus.final = tempStatus.final.toString();
          tempStatus.active = tempStatus.active.toString();
          tempStatus.private = tempStatus.private.toString();

          var updateStatusPromise = Restangular.one('reports').one('categories', categoryId).one('statuses', tempStatus.id).customPUT(tempStatus);

          updateStatusPromise.then(function () {
            // all saved
          }); // jshint ignore:line
        }
      }

      $modalInstance.close();
    };

    var flowListPromise;
    $scope.getFlowList = function () {
      flowListPromise = flowListPromise || FlowsService.fetchAll({
          return_fields: 'id,title'
        });

      return flowListPromise;
    };

    $scope.selectFlow = function (item, status) {
      status.flow_id = item.id;
      status.flow_title = item.title;
    };

    $scope.unselectFlow = function(item, status){
      if(status.flow || status.flow_id) {
        status.flow = null;
        status.flow_id = null;
        status.flow_title = null;
      }
    };

    _.each($scope.category.statuses, function (status) {
      if (status.flow) {
        status.selectedFlowsId = [status.flow.id];
      }
    });
  });

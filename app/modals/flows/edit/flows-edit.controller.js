'use strict';

angular
  .module('FlowsEditModalControllerModule', [
    'FlowsServiceModule'
  ])

  .controller('FlowsEditModalController', function ($scope, $modalInstance, Restangular, FlowsService, flows, flow) {

    var resolutionState = {
      'default': false,
      'active': true,
      'title': ''
    };

    $scope.flow = angular.copy(flow);

    $scope.resolutionState = angular.copy(resolutionState);

    $scope.validResolutionStateTitle = false;

    $scope.update = function () {
      $scope.updatePromise = FlowsService.update($scope.flow);
      $scope.updatePromise.then(function(response) {
        if (flows) {
          flows[flows.indexOf(flow)] = $scope.flow;
        }

        $scope.showMessage('ok', 'O fluxo foi editado com sucesso!', 'success');
        $modalInstance.close($scope.flow);
      });
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.createResolutionState = function () {
      // Search for a inactive resolution state
      var resolutionState = _.findWhere($scope.flow.resolution_states, {'title': $scope.resolutionState.title, 'active': false});

      if (resolutionState) {
        resolutionState.default = false;
        resolutionState.active = true;
      } else {
        $scope.flow.resolution_states.push(angular.copy($scope.resolutionState));
      }

      $scope.resolutionState = angular.copy(resolutionState);

      $scope.validResolutionStateTitle = false;
    };

    $scope.removeResolutionState = function (resolutionState) {
      $scope.flow.resolution_states = _.map($scope.flow.resolution_states, function(rs){
        if(rs.title == resolutionState.title) {
          rs.default = false;
          resolutionState.active = false;
        }

        return rs;
      });
    };

    $scope.changeDefaultResolutionState = function (resolutionState) {
      var resolutionStateIndex = _.findIndex($scope.flow.resolution_states, resolutionState);
      _.each($scope.flow.resolution_states, function (state, index) {
        if (resolutionStateIndex != index) {
          state.default = false;
        }
      });
    };

    var flowHasStatusWithTitle = function (title) {
      // This could be cache in array for better performance
      return _.some(_.filter($scope.flow.resolution_states, function (state) {
        return state.active === true && state.title === title;
      }));
    };

    $scope.validateResolutionStateTitle = function (title) {
      $scope.validResolutionStateTitle = !!(title && title.length > 0 && !flowHasStatusWithTitle(title));
    };
  });

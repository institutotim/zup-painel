'use strict';

angular
  .module('FlowsStepsAddModalControllerModule', [])

  .controller('FlowsStepsAddModalController', function ($scope, $modalInstance, $q, Restangular, flow) {

    $scope.flow = {
      stepType: 'form'
    };

    $scope.selectedFlow = null;

    $scope.selectFlow = function (flow) {
      $scope.selectedFlow = flow;
    };

    var flowsAncestorsPromise = Restangular.one('flows', flow.id).all('ancestors').getList();
    var flowsPromise = Restangular.all('flows').getList({'display_type': 'full'});

    $q.all([flowsPromise, flowsAncestorsPromise]).then(function (responses) {
      $scope.flows = responses[0].data;
      var ancestors = responses[1].data;

      for (var i = $scope.flows.length - 1; i >= 0; i--) {
        if (ancestors.indexOf($scope.flows[i].id) !== -1) {
          $scope.flows[i].hidden = true;
        }
      }
    });

    $scope.save = function () {
      var step;

      if ($scope.flow.stepType === 'form') {
        step = {
          title: $scope.flow.title,
          step_type: 'form'
        }; // jshint ignore:line
      } else {
        step = {
          title: $scope.selectedFlow.title,
          step_type: 'flow',
          child_flow_id: $scope.selectedFlow.id
        }; // jshint ignore:line
      }

      $scope.saveStepPromise = Restangular.one('flows', flow.id).post('steps', step);

      $scope.saveStepPromise.then(function (response) {
        flow.my_steps.push(Restangular.stripRestangular(response.data));
        $modalInstance.close();
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });

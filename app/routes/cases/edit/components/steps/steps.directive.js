'use strict';

angular
  .module('CaseStepsDirectiveModule', [])
  .directive('caseSteps', function () {
    return {
      restrict: 'E',
      scope: {
        activeStep: '=',
        previousSteps: '=',
        nextSteps: '=',
        currentStep: '=',
        onStepSelect: '&'
      },
      templateUrl: 'routes/cases/edit/components/steps/steps.template.html',
      controller: function ($scope) {
        $scope.selectStep = function(step){
          $scope.onStepSelect({ step: step });
        };
      }
    };
  });

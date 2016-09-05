(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsEditFormDirectiveModule', [
      'angularInlineEdit'
    ])
    .directive('businessReportsEditForm', businessReportsEditForm);

  businessReportsEditForm.$inject = [];
  function businessReportsEditForm() {
    return {
      restrict: 'E',
      scope: {
        editable: '=',
        report: '=',
        valid: '='
      },
      templateUrl: 'routes/business-reports/edit/components/form/business-reports-edit-form.template.html',
      controller: businessReportsEditFormController
    };
  }

  businessReportsEditFormController.$inject = [
    '$scope',
    '$log'
  ];
  function businessReportsEditFormController($scope, $log) {
  }

})(angular);

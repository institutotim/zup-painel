(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsEditHeaderDirectiveModule', [])
    .directive('businessReportsEditHeader', businessReportsEditHeader);

  function businessReportsEditHeader() {
    return {
      restrict: 'E',
      scope: {
        report: '=',
        savePromise: '=',
        showPrintButton: '=',
        showEditButton: '=',
        showSaveButton: '=',
        enableSaveButton: '=',
        saveButtonClicked: '&',
        xlsButtonClicked: '&'
      },
      templateUrl: 'routes/business-reports/edit/components/header/business-reports-edit-header.template.html'
    };
  }

})(angular);

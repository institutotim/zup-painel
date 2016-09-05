(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsExploreHeaderDirectiveModule', [])
    .directive('businessReportsExploreHeader', businessReportsExploreHeader);

  businessReportsExploreHeader.$inject = [];
  function businessReportsExploreHeader() {
    return {
      restrict: 'E',
      scope: {
      },
      templateUrl: 'routes/business-reports/explore/components/header/business-reports-explore-header.template.html'
    };
  }

})(angular);

(function (angular) {
  'use strict';

  angular
    .module('SearchBoxComponentModule', [])
    .directive('searchBox', SearchBoxComponent);

  SearchBoxComponent.$inject = [];
  function SearchBoxComponent() {
    return {
      restrict: 'E',
      templateUrl: 'components/search-box/search-box.template.html',
      scope: {
        placeholder: '@',
        onSearch: '&'
      },
      controller: SearchBoxController,
      controllerAs: '$search'
    };
  }

  SearchBoxController.$inject = ['$scope', '$timeout'];
  function SearchBoxController($scope, $timeout) {
    var vm = this;

    vm.query = '';
    vm.placeholder = $scope.placeholder;
    vm.onQueryChange = onQueryChange;

    var searchPromise = null;
    function onQueryChange() {
      if (searchPromise) $timeout.cancel(searchPromise);

      searchPromise = $timeout(function () {
        $scope.onSearch({ query: vm.query });
      }, 1000);
    }
  }
})(angular);

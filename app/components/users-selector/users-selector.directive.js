(function (angular) {
  'use strict';

  angular
    .module('UsersSelectorComponentModule', [
      'UsersServiceModule'
    ])
    .directive('usersSelector', UsersSelectorDirective);

  function UsersSelectorDirective() {
    return {
      restrict: 'E',
      scope: {
        onSelect: '&'
      },
      controller: UsersSelectorController,
      controllerAs: 'vm',
      templateUrl: 'components/users-selector/users-selector.template.html'
    };
  }

  UsersSelectorController.$inject = [
    '$scope', 'UsersService'
  ];
  function UsersSelectorController($scope, UsersService) {
    var vm = this;

    vm.user = null;
    vm.onUserSelect = onUserSelect;
    vm.fetchUsers = fetchUsers;

    function fetchUsers(query) {
      return UsersService.fetchAll({ query: query });
    }

    function onUserSelect($item, $model) {
      $scope.onSelect({user: $model});
      vm.user = null;
    }
  }

})(angular);

'use strict';

angular
  .module('AdvancedFiltersReporterModalControllerModule', [
    'FocusOnEventComponentModule',
    'UsersServiceModule'
  ])
  .controller('AdvancedFiltersReporterModalController', function ($scope, $modalInstance, activeAdvancedFilters, UsersService) {
    $scope.activeAdvancedFilters = activeAdvancedFilters;
    $scope.users = [];
    $scope.field = {};

    $scope.usersAutocomplete = {
      options: {
        onlySelect: true,
        source: function (request, uiResponse) {
          var categoriesPromise = UsersService.fetchAll({
            query: request.term,
            per_page: 10
          });

          categoriesPromise.then(function (response) {
            uiResponse(_.map(response, function (user) {
              return {
                label: user.name,
                value: user.name,
                user: {id: user.id, name: user.name}
              };
            }));
          });
        },
        messages: {
          noResults: '',
          results: angular.noop
        }
      }
    };

    $scope.usersAutocomplete.events = {
      select: function (event, ui) {
        var found = false;

        for (var i = $scope.users.length - 1; i >= 0; i--) {
          if ($scope.users[i].id === ui.item.user.id) {
            found = true;
          }
        }

        if (!found) {
          $scope.users.push(ui.item.user);
        }
      },

      change: function () {
        $scope.field.text = '';
        $scope.$broadcast('focusField', true);
      }
    };

    $scope.removeUser = function (user) {
      $scope.users.splice($scope.users.indexOf(user), 1);
    };

    $scope.save = function () {
      for (var i = $scope.users.length - 1; i >= 0; i--) {
        var filter = {
          title: 'Relatados por',
          type: 'reporters',
          desc: $scope.users[i].name,
          value: $scope.users[i].id
        };

        $scope.activeAdvancedFilters.push(filter);
      }

      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });

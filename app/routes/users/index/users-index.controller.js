'use strict';

angular
  .module('UsersIndexControllerModule', [
    'KeyboardPosterComponentModule',
    'GenericInputComponentModule',
    'UsersDisableModalControllerModule',
    'GroupSelectorModule'
  ])

  .controller('UsersIndexController', function ($scope, $q, $stateParams, $modal, Restangular, GroupSelectorService) {
    $scope.loading = true;
    $scope.loadingPagination = false;

    var page = 1, perPage = 30, total, searchText = '';

    // sorting the tables
    $scope.sort = {
      column: 'name',
      descending: false
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      // ReportsItemsService.resetCache();
      // $scope.refresh();
    };

    $scope.selectedCls = function (column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    // Return right promise
    var generateUsersPromise = function() {
      var options = {page: page, per_page: perPage, disabled: true, 'return_fields': 'id,name,disabled,email,phone,groups.id,groups.name', sort: $scope.sort};

      if ($scope.selectedGroups.length !== 0)
      {
        options['groups'] = _.map($scope.selectedGroups, function(g) { return g.id; }).join();
      }

      if (searchText.length !== 0)
      {
        options.query = searchText;
      }

      return Restangular.one('search').all('users').getList(options);
    };

    // Group filter
    $scope.selectedGroups = [];

    $scope.getGroupsExcerpt = function() {
      switch($scope.selectedGroups.length) {
        case 1:
          return 'Grupo: ' + $scope.selectedGroups[0].name;
          break;

        case 0:
          return 'Filtrar por grupo';
          break;

        default:
           return 'Grupo: ' + $scope.selectedGroups.length + ' grupos selecionados';
      }
    };

    $scope.filterUsersByGroup = function () {
      GroupSelectorService.open($scope.selectedGroups, true).then(function(selectedGroups){
        $scope.selectedGroups = selectedGroups;
        refresh();
      });
    };

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function(paginate) {
      if ($scope.loadingPagination === false)
      {
        $scope.loadingPagination = true;

        var usersPromise = generateUsersPromise();

        usersPromise.then(function(response) {
          if (paginate !== true)
          {
            $scope.users = response.data;
          }
          else
          {
            if (typeof $scope.users === 'undefined')
            {
              $scope.users = [];
            }

            for (var i = 0; i < response.data.length; i++) {
              $scope.users.push(response.data[i]);
            }

            // add up one page
            page++;
          }

          total = parseInt(response.headers().total);

          var lastPage = Math.ceil(total / perPage);

          if (page === (lastPage + 1))
          {
            $scope.loadingPagination = null;
          }
          else
          {
            $scope.loadingPagination = false;
          }

          $scope.loading = false;
        });

        return usersPromise;
      }
    };

    var refresh = function() {
      page = 1;

      $scope.loadingPagination = false;
      $scope.loadingSearch = true;
      $scope.users = [];

      getData(false).then(function() {
        $scope.loadingSearch = false;

        page++;
      });
    };

    // Search function
    $scope.search = function(text) {
      searchText = text;

      // reset pagination
      refresh();
    };

    $scope.disableUser = function (user) {
      $modal.open({
        templateUrl: 'modals/users/disable/users-disable.template.html',
        windowClass: 'removeModal',
        resolve: {
          user: function() {
            return user;
          }
        },
        controller: 'UsersDisableModalController'
      });
    };

    $scope.enableUser = function(user) {
      user.loading = true;

      var enableUserPromise = Restangular.one('users', user.id).customPUT({}, 'enable');

      enableUserPromise.then(function() {
        user.disabled = false;
        user.loading = false;

        $scope.showMessage('ok', 'O Usuário ' + user.name + ' foi ativado com sucesso.', 'success', false);
      });
    };
  });

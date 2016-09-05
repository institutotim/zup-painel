'use strict';

angular
  .module('GroupsAddUsersModalControllerModule', [])
  .controller('GroupsAddUsersModalController', function(Restangular, $scope, $modalInstance, $q, $state, group) {
    $scope.loadingPagination = false;

    $scope.sort = {
      column: '',
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
    };

    $scope.selectedCls = function (column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    var page = 1, perPage = 30, total, searchText = '';
    var required_fields = 'id,name,email,phone,group.id';

    // Return right promise
    var generateUsersPromise = function() {
      var searchOptions = { query: searchText, page: page, per_page: perPage };

      if ($scope.groupId)
      {
        // if we are searching with a group, hit /search/groups/{id}/users
        if (searchText !== '')
        {
          return Restangular.one('search').one('groups', $scope.groupId).all('users').getList(searchOptions); // jshint ignore:line
        }

        return Restangular.one('groups', $scope.groupId).all('users').getList({ page: page, per_page: perPage }); // jshint ignore:line
      }

      $scope.groupId = null;

      // if we searching, hit search/users
      if (searchText !== '')
      {
        return Restangular.one('search').all('users').getList(searchOptions); // jshint ignore:line
      }

      return Restangular.all('users').getList({page: page, per_page: perPage }); // jshint ignore:line
    };

    // Get groups for filters
    var groupsPromise = Restangular.all('groups').getList({ return_fields: 'id,name'});

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function(paginate) {
      if ($scope.loadingPagination === false)
      {
        $scope.loadingPagination = true;

        var usersPromise = generateUsersPromise();

        var promises = [usersPromise];

        if(!$scope.groups) {
          promises.push(groupsPromise);
        }

        $q.all(promises).then(function(responses) {
          if(!$scope.groups){
            $scope.groups = responses[1].data;
          }

          if (paginate !== true)
          {
            $scope.users = responses[0].data;
          }
          else
          {
            if (typeof $scope.users === 'undefined')
            {
              $scope.users = [];
            }

            for (var i = 0; i < responses[0].data.length; i++) {
              $scope.users.push(responses[0].data[i]);
            }

            // add up one page
            page++;
          }

          total = parseInt(responses[0].headers().total);

          var lastPage = Math.ceil(total / perPage);

          if (page === (lastPage + 1))
          {
            $scope.loadingPagination = null;
          }
          else
          {
            $scope.loadingPagination = false;
          }
        });

        return usersPromise;
      }
    };

    // Search function
    $scope.search = function(text) {
      searchText = text;

      // reset pagination
      page = 1;
      $scope.loadingPagination = false;

      $scope.loadingContent = true;

      getData().then(function() {
        $scope.loadingContent = false;

        page++;
      });
    };

    $scope.selectGroup = function(groupId) {
      $scope.groupId = groupId;

      // reset pagination
      page = 1;
      $scope.loadingPagination = false;

      $scope.loadingContent = true;

      getData().then(function() {
        $scope.loadingContent = false;

        page++;
      });
    };

    $scope.usersToAdd = [];

    $scope.isUserSelected = function(userId) {
      return $scope.usersToAdd.indexOf(userId) !== -1;
    };

    $scope.addUser = function(userId) {

      if(group.users.filter(function(e){ return e.id == userId; }).length > 0){
        $scope.addModalMessage('exclamation-sign', 'Usuário já relacionado ao grupo.', 'error');
      }else{
        $scope.usersToAdd.push(userId);
      }
    };

    $scope.removeUser = function(userId) {
      $scope.usersToAdd.splice($scope.usersToAdd.indexOf(userId), 1);
    };

    $scope.addUsers = function() {
      var putUsersPromise = Restangular.one('groups', group.id).customPUT({ users: $scope.usersToAdd });

      putUsersPromise.then(function() {
        $scope.showMessage('ok', 'Os usuários foram adicionados.', 'success', true);

        $state.go($state.current, {}, {reload: true});

        $modalInstance.close();
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

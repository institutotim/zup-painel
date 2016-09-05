'use strict';

angular
  .module('AdvancedFiltersGroupModalControllerModule', [])
  .controller('AdvancedFiltersGroupModalController', function ($scope, $rootScope, $modalInstance, activeAdvancedFilters, groupsResponse) {

    $scope.groups = [];
    $scope.activeAdvancedFilters = activeAdvancedFilters;
    var selectedGroupsIDs = [];

    $scope.groups = typeof groupsResponse.data !== 'undefined' ? groupsResponse.data : groupsResponse;

    _.each($scope.activeAdvancedFilters, function (filter) {
      if (filter.type === 'groups' && selectedGroupsIDs.indexOf(filter.value) === -1) {
        selectedGroupsIDs.push(filter.value);
      }
    });

    $scope.isActive = function (group) {
      return selectedGroupsIDs.indexOf(group.id) !== -1;
    };

    $scope.updateGroup = function (group) {
      var index = selectedGroupsIDs.indexOf(group.id);

      if (index === -1) {
        selectedGroupsIDs.push(group.id);
      } else {
        selectedGroupsIDs.splice(index, 1);
      }
    };

    $scope.save = function () {
      _.each(selectedGroupsIDs, function (id) {
        var group = _.where($scope.groups, { 'id': id })[0];

        if(!_.any($scope.activeAdvancedFilters, function (filter) { return filter.type == 'groups' && filter.value == group.id; })) {
          var filter = {
            title: 'Grupo',
            type: 'groups',
            desc: group.name,
            value: group.id
          };

          $scope.activeAdvancedFilters.push(filter);
        }
      });

      _.each($scope.activeAdvancedFilters, function (filter, index) {
        if(filter && filter.type == 'groups' && selectedGroupsIDs.indexOf(filter.value) === -1) {
          $scope.activeAdvancedFilters.splice(index, 1);
        }
      });

      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });

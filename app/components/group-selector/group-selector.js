'use strict';

angular
  .module('GroupSelectorModule', [])
  .controller('GroupSelectorController', function ($scope, $modalInstance, selectedGroups, multiple, promise, Restangular) {
    $scope.selectedGroups = angular.copy(selectedGroups);
    $scope.multiple = multiple;

    $scope.loading = true;
    Restangular.all('groups').getList({'return_fields': 'id,name'}).then(function (response) {
      $scope.loading = false;
      $scope.groups = Restangular.stripRestangular(response.data);
    });

    $scope.isActive = function (group) {
      return _.findWhere($scope.selectedGroups, { id: group.id });
    };

    $scope.toggle = function (group) {
      var match = _.findWhere($scope.selectedGroups, { id: group.id });

      if(!multiple) {
        $scope.selectedGroups = [match];
      } else {
        if (!match) {
          $scope.selectedGroups.push(group);
        }
        else {
          $scope.selectedGroups.splice(match, 1);
        }
      }
    };

    $scope.confirm = function () {
      promise.resolve($scope.selectedGroups);
      $modalInstance.close();
    };

    $scope.close = function () {
      promise.reject();
      $modalInstance.close();
    };
  })
  .factory('GroupSelectorService', function ($modal, $q) {
    return {
      open: function (selectedGroups, multiple) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'components/group-selector/group-selector.template.html',
          windowClass: 'groupSelectorModal',
          resolve: {
            promise: function () {
              return deferred;
            },

            selectedGroups: function () {
              return selectedGroups;
            },

            multiple: function () {
              return multiple;
            }
          },
          controller: 'GroupSelectorController'
        });

        return deferred.promise;
      }
    }
  });

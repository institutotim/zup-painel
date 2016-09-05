'use strict';

angular
  .module('GroupsEditModalControllerModule', [])
  .controller('GroupsEditModalController', function (Restangular, FullResponseRestangular, $scope, $modalInstance, $state, group) {
    $scope.group = angular.copy(group) || {name: '', permissions: {}};

    $scope.save = function () {
      $scope.processingForm = true;
      var groupPromise;

      if (!group) {
        groupPromise = FullResponseRestangular.one('groups')
          .withHttpConfig({treatingErrors: true})
          .post(null, $scope.group);

      } else {
        groupPromise = Restangular.one('groups', group.id).customPUT({name: $scope.group.name});
      }

      groupPromise.then(function (response) {
        $scope.processingForm = false;

        if (group) {
          $scope.showMessage('ok', 'O grupo foi editado.', 'success', true);
          group.name = $scope.group.name;
        }
        else {
          $scope.showMessage('ok', 'O grupo foi criado com sucesso.', 'success', true);
          $state.go('groups.show', {id: response.data.id});
        }

        $modalInstance.close();
      }, function (response) {
        $scope.processingForm = false;
        $scope.inputErrors = response.data.error;
      });
    };

    $scope.isObject = _.isObject;

    $scope.close = function () {
      $modalInstance.close();
    };
  });

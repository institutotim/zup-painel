'use strict';

angular
  .module('GroupsRemoveUserModalControllerModule', [])
  .controller('GroupsRemoveUserModalController', function($scope, $modalInstance, removeUserFromList, user, group, Restangular) {
    $scope.user = user;
    $scope.group = group;

    // delete user from server
    $scope.confirm = function() {
      var deletePromise = Restangular.one('groups', group.id).all('users').remove({ user_id: user.id })

      deletePromise.then(function() {
        $modalInstance.close();
        $scope.showMessage('ok', 'O Usuário ' + $scope.user.name + ' foi removido do grupo com sucesso', 'success', true);

        removeUserFromList($scope.user);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

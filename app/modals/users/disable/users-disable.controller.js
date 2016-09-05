'use strict';

angular
  .module('UsersDisableModalControllerModule', [])

  .controller('UsersDisableModalController', function(Restangular, $scope, $modalInstance, user) {
    $scope.user = user;

    $scope.confirm = function() {
      var deletePromise = Restangular.one('users', $scope.user.id).remove();

      deletePromise.then(function() {
        $modalInstance.close();
        $scope.showMessage('ok', 'O Usuário ' + $scope.user.name + ' foi desativado com sucesso.', 'success', false);

        user.disabled = true;
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

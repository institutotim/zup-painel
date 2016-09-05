'use strict';

angular
  .module('UsersShowControllerModule', [])

  .controller('UsersShowController', function ($scope, userResponse, $modal, $location) {
    $scope.user = userResponse.data;

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
  });

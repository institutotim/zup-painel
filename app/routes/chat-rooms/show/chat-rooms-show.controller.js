'use strict';

angular
  .module('ChatRoomsShowControllerModule', [
      'ChatServiceModule',
      'ChatRoomsEditModalControllerModule'
    ])

  .controller('ChatRoomsShowController', function ($scope, $modal, ChatService, User, room) {
    $scope.room = room;
    $scope.user = User;

    $scope.editRoom = function () {
      $modal.open({
        templateUrl: 'modals/chat-rooms/edit/chat-rooms-edit.template.html',
        windowClass: 'chatRoomsEditModal',
        resolve: {
          room: function() {
            return $scope.room;
          }
        },
        controller: 'ChatRoomsEditModalController'
      });
    };

  });
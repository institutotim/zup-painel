'use strict';

angular
  .module('ChatRoomsEditModalControllerModule', [
      'ChatServiceModule'
    ])
  .controller('ChatRoomsEditModalController', function(ChatService, $scope, $modalInstance, $state, room) {
    $scope.room = angular.copy(room) || { title: '' };

    $scope.save = function() {
      $scope.processingForm = true;

      var promise = room === null ? ChatService.createRoom($scope.room) : ChatService.updateRoom($scope.room);

      promise.then(function(response) {
        $scope.processingForm = false;

        if (room) {
          $scope.showMessage('ok', 'A sala de chat foi editada.', 'success', true);
          room.title = $scope.room.title;
        } else {
          $scope.showMessage('ok', 'A sala de chat foi criada com sucesso.', 'success', true);
          $state.go('chat-rooms.show', { id: response.data.id });
        }

        $modalInstance.close();
      }, function(response) {
        $scope.processingForm = false;
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });

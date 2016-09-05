'use strict';

angular
  .module('ChatRoomsIndexControllerModule', [
      'ChatServiceModule',
      'ChatRoomsEditModalControllerModule'
    ])

  .controller('ChatRoomsIndexController', function ($scope, $modal, $timeout, ChatService) {
    var page = 1, per_page = 30;

    $scope.rooms = [];
    $scope.searchQuery = '';

    var getRooms = function () {
      var options = {
        page: page,
        per_page: per_page
      };

      if ($scope.searchQuery !== '') {
        options.query = $scope.searchQuery;
      }

      return ChatService
        .getRooms(options)
        .then(function (response) {
          var rooms = response.data;

          if (rooms.length > 0) {
            $scope.rooms = $scope.rooms.concat(rooms);
            page++;
          }
        });
    };

    var searchTimeout;
    $scope.$watch('searchQuery', function(oldValue, newValue) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }

      searchTimeout = $timeout(function () {
        if (angular.equals(newValue, oldValue) === false) {
          $scope.reload();
        }
      }, 1000);
    });

    $scope.loadRooms = function () {
      $scope.loadingPagination = true;
      getRooms().then(function () {
        $scope.loadingPagination = false;
      });
    };

    $scope.reload = function () {
      $scope.rooms = [];
      page = 1;

      $scope.loadRooms();
    };

    $scope.createRoom = function () {
      $modal.open({
        templateUrl: 'modals/chat-rooms/edit/chat-rooms-edit.template.html',
        windowClass: 'chatRoomsEditModal',
        resolve: {
          room: function() {
            return null;
          },
          rooms: function() {
            return $scope.rooms;
          }
        },
        controller: 'ChatRoomsEditModalController'
      });
    };

    $scope.deleteRoom = function (room) {
      $modal.open({
        templateUrl: 'modals/chat-rooms/destroy/chat-rooms-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          rooms: function(){
            return $scope.rooms;
          }
        },
        controller: ['$scope', '$modalInstance', 'rooms', function($scope, $modalInstance, rooms) {
          $scope.room = room;

          $scope.confirm = function() {
            ChatService.deleteRoom($scope.room)
              .then(function() {
                $modalInstance.close();

                $scope.showMessage('ok', 'A sala de chat foi excluida com sucesso.', 'success', true);
                rooms.splice(rooms.indexOf($scope.room), 1);
              });
          };

          $scope.close = function() {
            $modalInstance.close();
          };
        }]
      });
    };
  });

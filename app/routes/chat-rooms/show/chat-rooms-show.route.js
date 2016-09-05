angular
  .module('ChatRoomsShowModule', [
    'ChatRoomsShowControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('chat-rooms.show', {
      url: '/{id:[0-9]{1,4}}',
      views: {
        '': {
          templateUrl: 'routes/chat-rooms/show/chat-rooms-show.template.html',
          controller: 'ChatRoomsShowController',
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        'room': ['ChatService', '$stateParams', function (ChatService, $stateParams) {
          return ChatService
            .getRoom($stateParams.id)
            .then(function (response) {
              return response.data;
            });
        }]
      }
    });

  }]);

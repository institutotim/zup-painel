angular
  .module('ChatRoomsIndexModule', [
    'ChatRoomsIndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('chat-rooms.list', {
      url: '',

      views: {
        '': {
          templateUrl: 'routes/chat-rooms/index/chat-rooms-index.template.html',
          controller: 'ChatRoomsIndexController',
          controllerAs: 'ctrl'
        }
      }
    });

  }]);

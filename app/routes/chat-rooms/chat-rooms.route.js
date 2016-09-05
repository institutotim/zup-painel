angular
  .module('ChatRoomsModule', [
    'ChatRoomsIndexModule',
    'ChatRoomsShowModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('chat-rooms', {
      abstract: true,
      url: '/chat-rooms',
      templateUrl: 'routes/chat-rooms/chat-rooms.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }]
      }
    });

  }]);

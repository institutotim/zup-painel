'use strict';

angular
  .module('NotificationsCenterComponentModule', [
    'NotificationServiceModule'
  ])
  .directive('notificationsCenter', NotificationsCenterComponent)
  .directive('notification', NotificationComponent);

  function NotificationsCenterComponent() {
    ComponentController.$inject = ['$rootScope', '$state', 'Popup', 'NotificationService', '$interval', '$timeout'];

    return {
      restrict: 'E',
      templateUrl: 'components/notifications-center/notifications-center.template.html',
      scope: {},
      controller: ComponentController,
      controllerAs: 'component'
    };

    function ComponentController($rootScope, $state, Popup, NotificationService, $interval, $timeout) {
      var vm = this;

      vm.notifications = [];
      vm.loading = false;
      vm.lastHighlightedNotificationCount = 0;
      vm.onClickNotification  = onClickNotification;
      vm.onDeleteNotification = onDeleteNotification;
      vm.onShownNotifications = onShownNotifications;

      $rootScope.$on('$stateChangeStart', function (event) {
        Popup.close();
      });

      function initialize() {
        _getNotifications();
      }

      // We don't destroy this because its always present in the application
      $interval(function(){
        if(!vm.loading) {
          _getNotifications();
        }
      }, 5000);

      function onShownNotifications() {
        if (vm.unreadCount == 0) return;

        NotificationService.markAllRead().then(
          function () {
            vm.unreadCount = 0;
          }
        );
      }

      function onDeleteNotification(notification) {
        return NotificationService.delete(notification.id).then(
          function () {
            var index = vm.notifications.indexOf(notification);
            vm.notifications.splice(index, 1);
          }
        );
      }

      function onClickNotification(notification) {
        var states = {
          'chat_room': 'chat-rooms.show',
          'case': 'cases.edit'
        };

        var state = _getState(states, 'notificable', notification);

        $state.go(state.name, { id: state.id });
      }

      function highlightNotificationBar() {
        vm.highlightNotificationBar = true;

        $timeout(function(){
          vm.highlightNotificationBar = false;
        }, 1000);
      }

      function _getNotifications() {
        vm.loading = true;
        NotificationService.getAll().then(
          function (data) {
            vm.loading = false;
            vm.notifications = data.notifications;
            vm.unreadCount = data.unread_count || 0;
            if(vm.unreadCount > vm.lastHighlightedNotificationCount) {
              vm.lastHighlightedNotificationCount = vm.unreadCount;
              highlightNotificationBar();
            }
          }
        );
      }

      function _getState(states, attr, object) {
        var id = attr + '_id', type = attr + '_type';
        var state = states[object[type]];

        if (_.isObject(state)) {
          state = _getState(state.states, state.attr, object[attr]);
        } else {
          state = {
            name: state,
            id: object[id]
          }
        }

        return state;
      }

      initialize();
    }
  }

  function NotificationComponent() {
    return {
      restrict: 'E',
      templateUrl: 'components/notifications-center/notification.template.html',
      scope: {
        notification: '=',
        deleteHandler: '&',
        clickHandler: '&'
      },
      controller: ['$scope', function ($scope) {
        $scope.getIconClass = function (notification) {
          var icons = {
            'chat_message': 'fa fa-comment',
            'case': 'fa fa-file'
          };

          return icons[notification.notificable_type] || '';
        }
      }]
    }
  }

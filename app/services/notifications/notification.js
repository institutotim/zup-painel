'use strict';

angular
  .module('NotificationServiceModule', [])
  .factory('NotificationService', NotificationService);

NotificationService.$inject = ['FullResponseRestangular'];

function NotificationService(FullResponseRestangular) {
  return {
    getAll: getAll,
    markAllRead: markAllRead,
    delete: deleteNotification
  };

  function getAll(options) {
    options = _.extend({}, options);

    return FullResponseRestangular
      .all('notifications')
      .withHttpConfig({treatingErrors: true})
      .customGET(null, options)
      .then(function (response) {
        response.data.notifications = _.map(response.data.notifications,
          function (notification) {
            notification.description = _replaceMentions(notification.description);
            return notification;
          }
        );

        return response.data;
      });
  }

  function markAllRead() {
    return FullResponseRestangular
      .all('notifications')
      .withHttpConfig({treatingErrors: true})
      .customPUT(null, 'read-all');
  }

  function deleteNotification(id) {
    return FullResponseRestangular
      .one('notifications', id)
      .withHttpConfig({treatingErrors: true})
      .remove();
  }

  function _replaceMentions(raw) {
    return raw.replace(/@\[(.*):(.*)\]/,
      function (match, id, name) {
        return name;
      });
  }
}

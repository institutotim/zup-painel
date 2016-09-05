'use strict';

/**
 * Provides an API client for the ZUP chat endpoints
 * @module ChatServiceModule
 * @author Jairo André (jairo.andre@gmail.com)
 */
angular
  .module('ChatServiceModule', [])
  .factory('ChatService', function (Restangular, ReturnFieldsService) {
    var ChatService = {};

    /**
     *
     * @param objectType
     * @param id
     * @param options
     * @returns {*}
     */
    ChatService.listMessages = function (objectType, id, options) {
      var defaults = {
        return_fields: ReturnFieldsService.convertToString([
          "kind", "text", "created_at",
          {
            "user": [
              "id", "name"
            ]
          }
        ])
      };

      options = angular.extend(defaults, options);

      return Restangular
        .one(objectType, id)
        .withHttpConfig({treatingErrors: false})
        .customGET('chat', options);
    };

    /**
     *
     * @param content
     * @param objectType
     * @param id
     * @returns {*}
     */
    ChatService.postMessage = function (content, objectType, id) {
      return Restangular
        .one('chat')
        .withHttpConfig({treatingErrors: false})
        .post('messages', {
          text: content,
          chattable_type: objectType,
          chattable_id: id,
          return_fields: 'id,chattable_id,chattable_type,kind,text,created_at,user.id,user.name'
        });
    };

    ChatService.autoCompleteUser = function (term) {
      return Restangular
        .one('autocomplete')
        .withHttpConfig({treatingErrors: false})
        .getList('user', {
          term: term
        });
    }

    /**
     * Returns all rooms
     *
     * @param {Object} options - Extra options for the endpoint
     * @returns {*}
     */
    ChatService.getRooms = function (options) {
      return Restangular
        .all('chat_rooms')
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options);
    }

    /**
     * Create a chat room
     *
     * @param {Object} room - Chat room
     * @returns {*}
     */
    ChatService.createRoom = function (room) {
      return Restangular
        .all('chat_rooms')
        .withHttpConfig({treatingErrors: true})
        .post(room);
    }

    /**
     * Update a chat room
     *
     * @param {Object} room - Chat room
     * @returns {*}
     */
    ChatService.updateRoom = function (room) {
      return Restangular
        .one('chat_rooms', room.id)
        .withHttpConfig({treatingErrors: true})
        .put(room);
    }

    /**
     * Delete a chat room
     *
     * @param {Object} room - Chat room
     * @returns {*}
     */
    ChatService.deleteRoom = function (room) {
      return Restangular
        .one('chat_rooms', room.id)
        .withHttpConfig({treatingErrors: true})
        .remove();
    }
    /**
     * Fetch a chat room
     *
     * @param {Integer} id - Chat rooms's id
     * @returns {*}
     */
    ChatService.getRoom = function (id) {
      return Restangular
        .one('chat_rooms', id)
        .withHttpConfig({treatingErrors: true})
        .get();
    }


    return ChatService;
  });

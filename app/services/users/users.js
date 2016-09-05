'use strict';

/**
 * Provides an API client for the reports items from ZUP API
 * @module UsersServiceModule
 */
angular
  .module('UsersServiceModule', [])
  .factory('UsersService', function ($q, FullResponseRestangular) {
    var self = {};

    /**
     * Fetch all users
     * @param {Object} options
     */
    self.fetchAll = function (options) {
      var defaults = {};

      defaults.display_type = 'full';

      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .all('users')
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          return response.data.users;
        });
    };

    /**
     * Fetch a single user
     * @param {Integer} id - User's id
     * @param {Object} options - Extra options
     */
    self.fetch = function (id, options) {
      var defaults = {};

      defaults.display_type = 'full';

      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('users', id)
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          return response.data.user;
        });
    };

    /**
     * Create user
     * @param {Object} user
     * @param {Object} options - Extra options
     */
    self.create = function (user, options) {
      var defaults = {};
      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('users')
        .withHttpConfig({treatingErrors: true})
        .post(null, user, options)
        .then(function (response) {
          return response.data.user;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    /**
     * Update user
     * @param {Object} user
     * @param {Object} options - Extra options
     */
    self.update = function (user, options) {
      var defaults = {};
      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('users', user.id)
        .withHttpConfig({treatingErrors: true})
        .customPUT(user, null, options)
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    self.recoverPassword = function (token, newPassword, newPasswordConfirmation) {
      var content = {
        token: token,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      };

      return FullResponseRestangular
        .one('reset_password')
        .withHttpConfig({treatingErrors: true})
        .customPUT(content, null)
        .catch(function (response) {
          return $q.reject(response.data.error);
        })
    };

    return self;
  });

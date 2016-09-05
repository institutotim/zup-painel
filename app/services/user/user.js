'use strict';

angular
  .module('UserServiceModule', [])

  .service('User', ['$q', 'Auth', '$rootScope', '$state', function ($q, Auth, $rootScope, $state) {

    return function (options) {
      if (!options) options = {permissions: []};

      var deferred = $q.defer();

      Auth.check().then(function (user) {
        $rootScope.me = user;

        /**
         *   hasPermission() checks if a user has a permission inside `user`.
         *
         *   To check permissions that contains id's like `inventory_fields_can_edit` use:
         *   hasPermission('inventory_fields_can_edit', 32)
         *
         *   it will return true if user can edit it.
         **/
        $rootScope.hasPermission = function (permission, id) {
          for (var permissionName in user.permissions) {
            if (permissionName === permission) {
              if (_.isBoolean(user.permissions[permissionName])) {
                return (user.permissions[permissionName] === true);
              }
              else if (_.isObject(user.permissions[permissionName])) {
                // if there is not `id` specified, we just check if the permission is empty
                if (_.isUndefined(id)) {
                  return (user.permissions[permissionName] && user.permissions[permissionName].length !== 0);
                }

                // returns true if the user has the permission for any of the given objects
                if (_.isArray(id)) {
                  var ids = _.map(id, function (id) {
                    if (_.isObject(id) && !_.isUndefined(id.id)) {
                      return id.id;
                    }
                    return id;
                  });

                  for (var i = 0, len = ids.length; i < len; i++) {
                    var obj_id = ids[i];

                    for (var z = user.permissions[permissionName].length - 1; z >= 0; z--) {
                      if (obj_id == user.permissions[permissionName][z]) {
                        return true;
                      }
                    }
                  }
                }

                // in case there is a `id` specified, we need to look into the array
                for (var i = user.permissions[permissionName].length - 1; i >= 0; i--) {
                  if (id == user.permissions[permissionName][i]) {
                    return true;
                  }
                }
              }
            }
          }

          return false;
        };

        $rootScope.hasAnyPermission = function (permissions, resourceId) {
          for (var i = permissions.length - 1; i >= 0; i--) {
            if ($rootScope.hasPermission(permissions[i], resourceId)) {
              return true;
            }
          }

          return false;
        };

        if (!$rootScope.hasPermission('panel_access')) {
          $state.go('user.unauthorized');
        }

        deferred.resolve(user);
      }, function () {
        // user is not logged
        deferred.resolve(null);

        // if user isn't logged we shall redirect to home page
        if (options.permissions.indexOf('isLogged') !== -1) {
          $state.go('user.login');
        }
      });

      var promise = deferred.promise;
      return promise ? promise : null;
    };
  }]);

'use strict';

angular
  .module('AuthServiceModule', ['cubesConfigurationModule'])

  .factory('Auth', ['$q', 'Restangular', 'FullResponseRestangular', '$cookies', '$rootScope', 'ReturnFieldsService', 'cubesConfigurationService', 'ENV', function ($q, Restangular, FullResponseRestangular, $cookies, $rootScope, ReturnFieldsService, cubesConfigurationService, ENV) {
    var user = null, acessibleNamespaces = [];

    return {
      check: function () {
        var deferred = $q.defer(),
          token = this.getToken();

        if (token !== null && user === null) {
          // has token, check it by getting user data
          var req = FullResponseRestangular.one('me').get({return_fields: 'id,name,email,permissions,groups.id,groups.name'}),
            that = this;

          req.then(function (response) {
            // save user data returned by API
            that.saveUser(response.data.user);
            acessibleNamespaces = response.data.acessible_namespaces;
            that._validateCurrentNamespace();
            deferred.resolve(user);
          }, function () {
            deferred.reject();
            that.clearToken();
          });
        }
        else if (token !== null && user !== null) {
          // Has token and user data
          deferred.resolve(user);
        }
        else {
          // Doesn't have token, user needs to log in
          deferred.reject();
          this.clearToken();
        }

        cubesConfigurationService.setCubesUrl(ENV.apiEndpoint + '/cubes');

        return deferred.promise;
      },

      getToken: function () {
        var cookie = $cookies.token;

        if (typeof cookie === 'undefined') {
          return null;
        }

        return cookie;
      },

      getConfiguration: function(){
        return $cookies.configuration ? JSON.parse($cookies.configuration) : {};
      },

      saveConfiguration: function(){
        $cookies.configuration = JSON.stringify(configuration);
      },

      saveToken: function(token) {
        $cookies.token = token;
      },

      _validateCurrentNamespace: function () {
        var currentNamespace = this.getCurrentNamespace();

        // If we have a selected namespace, verify if its still acessible
        if (currentNamespace && !_.findWhere(acessibleNamespaces, {id: currentNamespace.id})) {
          currentNamespace = null;
        }

        // If we don't have a selected namespace, just select the first from the list of acessible ones if we can
        if (!currentNamespace && acessibleNamespaces.length > 0) {
          _.each(acessibleNamespaces, function(namespace){
            if(!namespace.default) {
              currentNamespace = namespace;
            }
          });

          if(!currentNamespace) {
            currentNamespace = acessibleNamespaces[0];
          }

          this.setCurrentNamespace(currentNamespace);
        }

        $rootScope.namespace = currentNamespace;
      },

      getCurrentNamespace: function () {
        return $cookies.currentNamespace ? JSON.parse($cookies.currentNamespace) : null;
      },

      getCurrentNamespaceID: function () {
        var currentNamespace = this.getCurrentNamespace();
        return currentNamespace ? currentNamespace.id : null;
      },

      setCurrentNamespace: function (namespace) {
        $cookies.currentNamespace = JSON.stringify(namespace);
        FullResponseRestangular.setDefaultHeaders(_.extend(FullResponseRestangular.defaultHeaders, {'X-App-Namespace': namespace.id}));
        Restangular.setDefaultHeaders(_.extend(Restangular.defaultHeaders, {'X-App-Namespace': namespace.id}));
        $rootScope.namespace = namespace;
      },

      clearToken: function() {
        delete $cookies.token;
      },

      clearUser: function () {
        user = null;
        $rootScope.user = null;
      },

      saveUser: function (data) {
        user = data;
      },

      isLogged: function () {
        return user !== null && this.getToken() !== null;
      },

      login: function (email, pass) {
        var returnFields = ["permissions", "id", "email", "name", "groups_names", "token", {"groups": ["id"]}];

        FullResponseRestangular.setDefaultHeaders({'X-App-Token': this.getToken()});

        var deferred = $q.defer(), req = FullResponseRestangular.one('authenticate').withHttpConfig({
          treatingErrors: true,
          treatingUnauthorizedErrors: true
        }).post(null, {
          email: email,
          password: pass
        }, {'return_fields': ReturnFieldsService.convertToString(returnFields)}), that = this;

        req.then(function (response) {
          that.saveUser(response.data.user);
          that.saveToken(response.data.token);
          acessibleNamespaces = response.data.acessible_namespaces;
          that._validateCurrentNamespace();

          cubesConfigurationService.setCubesUrl(ENV.apiEndpoint + '/cubes');

          Restangular.setDefaultHeaders({
            'X-App-Token': response.data.token,
            'X-App-Namespace': that.getCurrentNamespaceID()
          });

          FullResponseRestangular.setDefaultHeaders({
            'X-App-Token': response.data.token,
            'X-App-Namespace': that.getCurrentNamespaceID()
          });

          deferred.resolve();
        }, function () {
          deferred.reject();
        });

        return deferred.promise;
      },

      logout: function () {
        this.clearToken();
        this.clearUser();
      }
    };
  }]);

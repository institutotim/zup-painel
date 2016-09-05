'use strict';

angular
  .module('UsersSelectorInlineModule', [])
  .directive('usersSelectorInline', function (Restangular) {
    return {
      restrict: 'E',
      scope: {
        users: '=',
        permittedGroups: '=',
        multiple: '='
      },
      templateUrl: 'components/users-selector-inline/users-selector-inline.template.html',
      controllerAs: 'usersSelectorCtrl',
      controller: function ($scope, $element) {
        $scope.usersAutocomplete = {
          options: {
            position: { my: 'left top', at: "left bottom", of: $element.find(".users-autocomplete") },
            onlySelect: true,
            source: function( request, uiResponse ) {
              var options = {
                name: request.term,
                return_fields: 'id,name',
                like: true
              };

              if (_.isArray($scope.permittedGroups) && $scope.permittedGroups.length > 0) {
                options.groups = _.pluck($scope.permittedGroups, 'id').join(',');
              }

              var usersPromise = Restangular.all('search/users').getList(options);

              usersPromise.then(function(response) {
                uiResponse( $.map( response.data, function( user ) {
                  return {
                    label: user.name,
                    value: user.name,
                    user: {id: user.id, name: user.name}
                  };
                }));
              });
            },
            messages: {
              noResults: '',
              results: angular.noop
            }
          }
        };

        $scope.usersAutocomplete.events = {
          select: function( event, ui ) {
            if($scope.multiple && !_.findWhere($scope.users, { id: ui.item.user.id })) {
              $scope.users.push(ui.item.user);
            } else {
              $scope.users[0] = ui.item.user;
            }
          },

          change: function() {
            $scope.user = '';
          }
        };

        $scope.removeUser = function(user){
          $scope.users.splice($scope.users.indexOf(user), 1);
        };
      }
    };
  });

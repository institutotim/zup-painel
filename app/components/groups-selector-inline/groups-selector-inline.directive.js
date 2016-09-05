'use strict';

angular
  .module('GroupsSelectorInlineModule', [

  ])
  .directive('groupsSelectorInline', function (Restangular) {
    return {
      restrict: 'E',
      scope: {
        groups: '=',
        permittedGroups: '=',
        multiple: '=',
        ignoreNamespaces: '='
      },
      templateUrl: 'components/groups-selector-inline/groups-selector-inline.template.html',
      controllerAs: 'groupsSelectorCtrl',
      controller: function ($scope, $element) {
        if ($scope.ignoreNamespaces === 'undefined') {
          $scope.ignoreNamespaces = true;
        }

        $scope.groupsAutocomplete = {
          options: {
            position: { my: 'left top', at: "left bottom", of: $element.find(".groups-autocomplete") },
            onlySelect: true,
            source: function( request, uiResponse ) {
              var options = {
                name: request.term,
                return_fields: 'id,name,namespace',
                like: true,
                ignore_namespaces: $scope.ignoreNamespaces
              };

              if (_.isArray($scope.permittedGroups) && $scope.permittedGroups.length > 0) {
                options.groups = _.pluck($scope.permittedGroups, 'id').join(',');
              }

              var categoriesPromise = Restangular.all('search/groups').getList(options);

              categoriesPromise.then(function(response) {
                uiResponse( $.map( response.data, function( group ) {
                  return {
                    label: group.name + ' (' + group.namespace.name +')',
                    value: group.name,
                    group: {id: group.id, name: group.name, namespace: { name: group.namespace.name }}
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

        $scope.groupsAutocomplete.events = {
          select: function( event, ui ) {
            if($scope.multiple && !_.findWhere($scope.groups, { id: ui.item.group.id })) {
              $scope.groups.push(ui.item.group);
            } else {
              $scope.groups[0] = ui.item.group;
            }
          },

          change: function() {
            $scope.group = '';
          }
        };

        $scope.removeGroup = function(group){
          $scope.groups.splice($scope.groups.indexOf(group), 1);
        };
      }
    };
  });

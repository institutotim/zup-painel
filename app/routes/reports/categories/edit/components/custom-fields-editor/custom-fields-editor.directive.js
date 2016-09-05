'use strict';

angular
  .module('CustomFieldsEditorDirectiveModule', [])
  .directive('customFieldsEditor', function () {
    return {
      restrict: 'E',
      scope: {
        categoryId: '=',
        fields: '=',
        onFieldsUpdate: '&'
      },
      templateUrl: 'routes/reports/categories/edit/components/custom-fields-editor/custom-fields-editor.template.html',
      controller: function ($scope, $element, FullResponseRestangular) {
        var fabricateNewField = function() {
          return {
            title: "",
            multiline: false
          };
        };

        $scope.newField = fabricateNewField();

        $scope.localFields = angular.copy($scope.fields);

        var persistFields = function () {
          return FullResponseRestangular.one('reports').one('categories', $scope.categoryId)
            .customPUT({
              custom_fields: $scope.fields,
              display_type: 'full',
              return_fields: 'custom_fields'
            });
        };

        $scope.save = function (field) {
          var persistedField;
          if (field.id) {
            persistedField = _.findWhere($scope.fields, {id: field.id});
            if (persistedField) {
              _.extend(persistedField, field);
            } else {
              $scope.fields.push(angular.copy(field));
            }
          } else {
            $scope.fields.splice($scope.localFields.indexOf(field), 0, field);
          }

          $scope.fieldPromise = persistFields().then(function (response) {
            field.editing = false;
            $scope.fields = response.data.category.custom_fields;
            $scope.localFields = _.map($scope.fields, function (field) {
              // If the persisted field already exists locally we try to preserve local state
              var localField = _.findWhere($scope.localFields, {id: field.id});

              if (localField) {
                return _.extend(localField, field);
              } else {
                return angular.copy(field);
              }
            });
          });
        };

        $scope.create = function (field) {
          $scope.localFields.push(field);
          $scope.newField = fabricateNewField();
          $scope.save(field);
        };

        $scope.cancel = function (field) {
          field = $scope.localFields[$scope.localFields.indexOf(field)] = field.original;
          field.editing = false;
        };

        $scope.edit = function (field) {
          field.original = angular.copy(field);
          field.editing = true;
        };

        $scope.remove = function (field) {
          $scope.localFields.splice($scope.localFields.indexOf(field), 1);

          if (field.id) {
            var persistedField = _.findWhere($scope.fields, {id: field.id});
            persistedField._destroy = true;
            persistFields();
          }
        };

        $scope.customFieldsAutocomplete = {
          options: {
            position: {my: 'left top', at: "left bottom", of: $element.find("#fieldAutocomplete")},
            onlySelect: true,
            source: function (request, uiResponse) {
              var fieldsPromise = FullResponseRestangular.all('reports/custom_fields').customGET(null, {
                title: request.term
              });

              fieldsPromise.then(function (response) {
                var fields = _.reject(response.data.custom_fields, function (field) {
                  return _.findWhere($scope.localFields, {id: field.id});
                });
                uiResponse(_.map(fields, function (field) {
                  return {
                    label: field.title,
                    value: field.title,
                    field: field
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

        $scope.customFieldsAutocomplete.events = {
          select: function (event, ui) {
            $scope.create(ui.item.field);
            $scope.$apply();
          }
        };
      }
    };
  });

(function (angular, $) {
  'use strict';

  angular.module('ItemsCategoriesEditControllerModule', [
    'ItemsCategoriesEditOptionsModalControllerModule',
    'ItemsCategoriesEditFieldValuesModalControllerModule',
    'ItemsCategoriesNewStatusModalControllerModule',
    'ItemsCategoriesEditStatusModalControllerModule',

    'InventorySortableSectionsComponentModule',
    'InventoryPopoverComponentModule',
    'InventoryPopoverLinkComponentModule',
    'InventoryDroppableInputsAreaComponentModule',
    'InventoryEditLabelComponentModule',
    'InputsSidebarComponentModule',
    'InventoryDraggableInputComponentModule',
    'InventoryEditSectionComponentModule',
    'InventoryTriggerComponentModule',
    'InventoryTriggerConditionComponentModule',
    'InventoriesCategoriesServiceModule'
  ])
  .controller('ItemsCategoriesEditController', ItemsCategoriesEditController);

  ItemsCategoriesEditController.$inject = [
    '$scope',
    '$rootScope',
    '$stateParams',
    'categoryResponse',
    'groupsResponse',
    'Restangular',
    '$localStorage',
    '$q',
    '$modal',
    '$timeout',
    '$window',
    '$state',
    'FileUploader',
    'formulasResponse',
    'analyzesResponse',
    'InventoriesCategoriesService',
    'ItemsCategoriesEditOptionsModalService',
    '$document'
  ];
  function ItemsCategoriesEditController($scope, $rootScope, $stateParams, categoryResponse, groupsResponse, Restangular, $localStorage, $q, $modal, $timeout, $window, $state, FileUploader, formulasResponse, analyzesResponse, InventoriesCategoriesService, ItemsCategoriesEditOptionsModalService, $document) {
    var updating = $scope.updating = false;
    $scope.groups = groupsResponse.data;

    if (categoryResponse) {
      updating = true;
      $scope.updating = true;

      $scope.category = categoryResponse.data;

      var categoryId = $scope.category.id;
    }

    $scope.analyzes = analyzesResponse.data;

    $scope.unsavedCategory = false;
    $scope.showDisabledFields = $localStorage;
    $scope.currentTab = 'fields';

    $scope.enableEditing = function () {
      $scope.editingCategoryTitle = true;
      $timeout(function () {
        $('#edit-title-input').focus();
      }, 100);
    };

    var numericKinds = ['integer', 'decimal', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle', 'date', 'time'];

    $scope.getLabelForMinField = function (kind) {
      return numericKinds.indexOf(kind) === -1 ? 'Min. de caracteres' : 'Valor mínimo';
    };

    $scope.getLabelForMaxField = function (kind) {
      return numericKinds.indexOf(kind) === -1 ? 'Máx. de caracteres' : 'Valor máximo';
    };

    $scope.availableInputs = [
      {kind: 'text', name: 'Campo de texto', multipleOptions: false},
      {kind: 'textarea', name: 'Campo de parágrafo', multipleOptions: false},
      {kind: 'integer', name: 'Campo numérico', multipleOptions: false},
      {kind: 'decimal', name: 'Campo decimal', multipleOptions: false},
      {kind: 'checkbox', name: 'Campo de múltipla escolha', multipleOptions: true},
      {kind: 'radio', name: 'Campo de escolha única', multipleOptions: true},
      {kind: 'select', name: 'Campo de lista', multipleOptions: true},
      {kind: 'meters', name: 'Campo em metros', multipleOptions: false},
      {kind: 'centimeters', name: 'Campo em centímetros', multipleOptions: false},
      {kind: 'kilometers', name: 'Campo em quilômetros', multipleOptions: false},
      {kind: 'years', name: 'Campo em anos', multipleOptions: false},
      {kind: 'months', name: 'Campo em meses', multipleOptions: false},
      {kind: 'days', name: 'Campo em dias', multipleOptions: false},
      {kind: 'hours', name: 'Campo em horas', multipleOptions: false},
      {kind: 'seconds', name: 'Campo em segundos', multipleOptions: false},
      {kind: 'angle', name: 'Campo de ângulo', multipleOptions: false},
      {kind: 'date', name: 'Campo de data', multipleOptions: false},
      {kind: 'time', name: 'Campo de tempo', multipleOptions: false},
      {kind: 'cpf', name: 'Campo de CPF', multipleOptions: false},
      {kind: 'cnpj', name: 'Campo de CNPJ', multipleOptions: false},
      {kind: 'url', name: 'Campo de URL', multipleOptions: false},
      {kind: 'email', name: 'Campo de e-mail', multipleOptions: false},
      {kind: 'images', name: 'Campo de imagens', multipleOptions: false},
    ];

    $scope.kindHasMultipleOptions = function (kind) {
      for (var i = $scope.availableInputs.length - 1; i >= 0; i--) {
        if ($scope.availableInputs[i].kind === kind) {
          return $scope.availableInputs[i].multipleOptions === true;
        }
      }

      return false;
    };

    $scope.onChangeFieldRequire = function (field, section) {
      console.log('onChangeFieldRequire:', field, section);
      if (!field.required) {
        section.required = false;
      }
    };

    $scope.onChangeSectionRequire = function (section) {
      console.log('onChangeSectionRequire:', section);
      if (section.required) {
        section.fields.forEach(function (field) {
          field.required = true;
        });
      }
    };

    var getGroupById = function (id) {
      return _.findWhere($scope.groups, {id: id});
    };

    if (updating) {
      $scope.category.plot_format = $scope.category.plot_format !== 'pin';

      for (var i = $scope.category.permissions.groups_can_edit.length - 1; i >= 0; i--) {
        $scope.category.permissions.groups_can_edit[i] = getGroupById($scope.category.permissions.groups_can_edit[i]);
      }

      for (var i = $scope.category.permissions.groups_can_view.length - 1; i >= 0; i--) {
        $scope.category.permissions.groups_can_view[i] = getGroupById($scope.category.permissions.groups_can_view[i]);
      }
    } else {
      $scope.category = {};

      // added fake fields
      $scope.category.title = 'Nova categoria sem título';
      $scope.category.color = '#2AB4DC';
      $scope.category.icon = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      $scope.category.marker = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      $scope.category.pin = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      $scope.category.plot_format = false; // jshint ignore:line
      $scope.category.global = false; // jshint ignore:line
      $scope.category.statuses = [];

      $scope.category.permissions = {groups_can_edit: [], groups_can_view: []};

      // we add all of our current groups into the `can_edit` array.
      for (var i = $scope.me.groups.length - 1; i >= 0; i--) {
        $scope.category.permissions.groups_can_edit.push($scope.me.groups[i]);
      }

      $scope.category.sections = [{
        'title': 'Localização',
        'required': true,
        'location': true,
        'permissions': {
          'groups_can_view': [],
          'groups_can_edit': []
        },
        'fields': [
          {
            'title': 'longitude',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 1,
            'label': 'Longitude',
            'maximum': null,
            'minimum': null,
            'required': true,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'postal_code',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 3,
            'label': 'CEP',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'road_classification',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 8,
            'label': 'Classificação Viária',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'city',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 5,
            'label': 'Cidade',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'latitude',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 0,
            'label': 'Latitude',
            'maximum': null,
            'minimum': null,
            'required': true,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'address',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 2,
            'label': 'Endereço',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'district',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 4,
            'label': 'Bairro',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'state',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 6,
            'label': 'Estado',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          },
          {
            'title': 'codlog',
            'kind': 'text',
            'size': null,
            'inventory_section_id': 14,
            'available_values': null,
            'position': 7,
            'label': 'Codlog',
            'maximum': null,
            'minimum': null,
            'required': false,
            'location': true,
            'permissions': {
              'groups_can_view': [],
              'groups_can_edit': []
            }
          }
        ]
      }];
    }

    // watch for modifications in $scope.category
    $scope.$watch('category', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.unsavedCategory = true;
      }
    }, true);

    // groups autocomplete
    $scope.groupsCanEditAutocomplete = {
      options: {
        onlySelect: true,
        source: function (request, uiResponse) {
          var categoriesPromise = Restangular.all('groups').getList({name: request.term});

          categoriesPromise.then(function (response) {
            uiResponse($.map(response.data, function (group) {
              return {
                label: group.name,
                value: group.name,
                group: {id: group.id, name: group.name, namespace: { name: group.namespace.name }}
              };
            }));
          });
        },
        messages: {
          noResults: '',
          results: function () {
          }
        }
      }
    };

    $scope.groupsCanViewAutocomplete = {
      options: {
        onlySelect: true,
        source: function (request, uiResponse) {
          var categoriesPromise = Restangular.all('groups').getList({name: request.term});

          categoriesPromise.then(function (response) {
            uiResponse($.map(response.data, function (group) {
              return {
                label: group.name,
                value: group.name,
                group: {id: group.id, name: group.name, namespace: { name: group.namespace.name }}
              };
            }));
          });
        },
        messages: {
          noResults: '',
          results: function () {
          }
        }
      }
    };

    $scope.groupsCanEditAutocomplete.events = {
      select: function (event, ui) {
        var found = false;

        for (var i = $scope.category.permissions.groups_can_edit.length - 1; i >= 0; i--) {
          if ($scope.category.permissions.groups_can_edit[i].id === ui.item.group.id) {
            found = true;
          }
        }

        if (!found) {
          $scope.category.permissions.groups_can_edit.push(ui.item.group);
        }
      },

      change: function () {
        $scope.groupCanEdit = '';
      }
    };

    $scope.groupsCanViewAutocomplete.events = {
      select: function (event, ui) {
        var found = false;

        for (var i = $scope.category.permissions.groups_can_view.length - 1; i >= 0; i--) {
          if ($scope.category.permissions.groups_can_view[i].id === ui.item.group.id) {
            found = true;
          }
        }

        if (!found) {
          $scope.category.permissions.groups_can_view.push(ui.item.group);
        }
      },

      change: function () {
        $scope.groupCanView = '';
      }
    };

    $scope.removeGroupCanView = function (group) {
      $scope.category.permissions.groups_can_view.splice($scope.category.permissions.groups_can_view.indexOf(group), 1);
    };

    $scope.removeGroupCanEdit = function (group) {
      $scope.category.permissions.groups_can_edit.splice($scope.category.permissions.groups_can_edit.indexOf(group), 1);
    };

    $scope.editFieldOptions = function (field) {
      $modal.open({
        templateUrl: 'modals/items/categories/edit-field-values/items-categories-edit-field-values.template.html',
        windowClass: 'editFieldOptions',
        controller: 'ItemsCategoriesEditFieldValuesModalController',
        resolve: {
          field: function () {
            return field;
          },

          setFieldOptions: function () {
            return function (options) {
              field.field_options = options;
            }
          }
        }
      });
    };

    $scope.$on('$locationChangeStart', function (evt) {
      if ($scope.unsavedCategory === true) {
        $scope.unsavedCategory = false;
        $scope.loading = true;
      }
    });

    $scope.goBack = function () {
      if ($scope.unsavedCategory === true) {
        $scope.unsavedCategory = false;
        $scope.loading = true;
        $state.go('items.categories', {}, {reload: true});
      } else {
        $scope.loading = true;
        $state.go('items.categories', {}, {reload: true});
      }
    };

    $scope.newSection = function () {
      $scope.$broadcast('hidePopovers');

      var newSection = {title: 'Nova seção sem título', required: false, location: false, fields: []};

      $scope.category.sections.push(newSection);

      // NO NO NO THIS WASNT SUPPOSE TO BE HERE :(:(::())) ILL CRY FOREVA
      // PLS BE SMAR T AND PUT IN A DIRECTIVE
      // PLS
      $('html, body').animate({scrollTop: $(document).height()}, 'slow');
    };

    // we add a new status and open the edit modal
    $scope.newStatus = function () {
      $modal.open({
        templateUrl: 'modals/items/categories/new-status/items-categories-new-status.template.html',
        windowClass: 'editInventoryStatusesModal',
        resolve: {
          statuses: function () {
            return $scope.category.statuses;
          },

          updating: function () {
            return updating;
          },

          categoryId: function () {
            return categoryId;
          }
        },
        controller: 'ItemsCategoriesNewStatusModalController'
      });
    };

    // modal for editing and adding a new status
    $scope.editStatus = function (status) {
      $modal.open({
        templateUrl: 'modals/items/categories/edit-status/items-categories-edit-status.template.html',
        windowClass: 'editInventoryStatusesModal',
        resolve: {
          status: function () {
            return status;
          },

          updating: function () {
            return updating;
          },

          categoryId: function () {
            return categoryId;
          }
        },
        controller: 'ItemsCategoriesEditStatusModalController'
      });
    };

    $scope.removeStatus = function (status) {
      if (typeof status.id !== 'undefined') {
        var deletePromise = Restangular.one('inventory').one('categories', categoryId).one('statuses', status.id).remove();

        deletePromise.then(function () {
          $scope.category.statuses.splice($scope.category.statuses.indexOf(status), 1);
        });
      } else {
        $scope.category.statuses.splice($scope.category.statuses.indexOf(status), 1);
      }
    };

    $scope.$on('hidePopovers', function (event, data) {
      // tell each popover to close before opening a new one
      $scope.$broadcast('hideOpenPopovers', data);
    });

    $scope.uploaderQueue = {items: []};

    $scope.editCategoryOptions = function () {
      ItemsCategoriesEditOptionsModalService.open($scope.category, $scope.uploaderQueue, $scope.send);
    };

    $scope.save_use_field_as_title = function (field) {
      if (field.use_as_title) {
        var fields = _.map($scope.category.sections, function(section){ return section.fields;});
        fields = _.flatten(fields);
        _.each(_.reject(fields, field), function (f) {
          f.use_as_title = false;
        });
      }
    };

    $scope.send = function () {
      $scope.processingForm = true;

      var icon, promises = [];

      // Add images to queue for processing it's dataUrl
      function addAsync(file) {
        var deferred = $q.defer();

        var picReader = new FileReader();

        picReader.addEventListener('load', function (event) {
          var picFile = event.target;

          icon = picFile.result.replace(/^data:image\/[^;]+;base64,/, '');
          deferred.resolve();
        });

        // pass as base64 and strip data:image
        picReader.readAsDataURL(file);

        return deferred.promise;
      }

      for (var i = $scope.uploaderQueue.items.length - 1; i >= 0; i--) {
        promises.push(addAsync($scope.uploaderQueue.items[i]._file));
      }

      // wait for images to process as base64
      return $q.all(promises).then(function () {

        // the permissions object should be only made of id's
        var formattedPermissions = {groups_can_edit: [], groups_can_view: []};

        for (var i = $scope.category.permissions.groups_can_edit.length - 1; i >= 0; i--) {
          formattedPermissions.groups_can_edit.push($scope.category.permissions.groups_can_edit[i].id);
        }

        for (var i = $scope.category.permissions.groups_can_view.length - 1; i >= 0; i--) {
          formattedPermissions.groups_can_view.push($scope.category.permissions.groups_can_view[i].id);
        }

        var formattedData = {
          title: $scope.category.title,
          require_item_status: $scope.category.require_item_status,
          statuses: $scope.category.statuses,
          color: $scope.category.color,
          plot_format: $scope.category.plot_format,
          permissions: formattedPermissions
        }; // jshint ignore:line
        var formattedFormData = {sections: $scope.category.sections};

        if ($rootScope.namespace.id === 1) {
          $scope.category.global = true;
        }

        if($scope.category.global === true) {
          formattedData.global = $scope.category.global;
        }

        // before sending the data to the server, we need to convert each new field's field_options to an array based method
        _.each(formattedFormData.sections, function (section) {
          _.each(section.fields, function (field, fieldKey) {
            /**
             * Prevent errors because user permissions
             */
            if (!_.isObject(field)) {
              return;
            }

            /**
             * We only should check for 'toRemove' attributes on newly fields
             */
            if (_.isUndefined(field.id)) {
              if (field.hasOwnProperty('toRemove')) {
                if (field.toRemove) {
                  section.fields.splice(fieldKey, 1);
                } else {
                  delete field.toRemove;
                }
              }
            }

            // if id is undefined then the field is newly created
            if (_.isUndefined(field.id) && _.isArray(field.field_options) && !_.isEmpty(field.field_options)) {
              var simpleArray = [];

              _.each(field.field_options, function (option) {
                simpleArray.push(option.value);
              });

              field.field_options = simpleArray;
            }
          });
        });

        if ($scope.category.plot_format === false) { // jshint ignore:line
          formattedData.plot_format = 'pin'; // jshint ignore:line
        } else {
          formattedData.plot_format = 'marker'; // jshint ignore:line
        }

        if (updating) {
          // we don't need to update 'statuses' when doing PUT
          // /\ SMART BOY!!!!
          delete formattedData.statuses;

          if (icon) {
            formattedData.icon = icon;
          }

          var putCategoryPromise =
            InventoriesCategoriesService
              .update(categoryId, formattedData)
              .then(function (category) {
                $scope.category.original_icon = category.original_icon;
              });

          var putCategoryFormsPromise =
            InventoriesCategoriesService
              .updateForm(categoryId, formattedFormData)
              .then(function (category) {
                $scope.category.sections = category.sections;
              });

          return $q.all([putCategoryPromise, putCategoryFormsPromise])
            .then(function () {
              $scope.showMessage('ok', 'A categoria de inventário foi atualizada com sucesso!', 'success', true);

              $scope.unsavedCategory = false;
              $scope.processingForm = false;

              InventoriesCategoriesService.purgeCache();
            })
            .catch(function (results) {
              var errors = results[0] || results[1];
              var errIndex = _.first(_.keys(errors));
              var errValue = _.first(_.values(errors)[0]);
              var errorMessage = errIndex.charAt(0).toUpperCase() + errIndex.slice(1) + ' ' + errValue;

              $scope.showMessage(
                'exclamation-sign',
                errorMessage,
                'error',
                true
              );

              $scope.processingForm = false;
            });
        } else {
          if (icon) {
            formattedData.icon = icon;
          } else {
            formattedData.icon = $scope.category.icon;
          }

          InventoriesCategoriesService
            .create(formattedData)
            .then(function (category) {
              var updateFieldsIds = {}, updateSectionId;

              /**
               * Update icon
               */
              $scope.category.original_icon = category.original_icon;

              // before updating the forms, let's set each field id to our own
              for (var i = category.sections.length - 1; i >= 0; i--) {
                if (category.sections[i].location === true) {
                  updateSectionId = category.sections[i].id;

                  // we populate updateFieldsIds with each field's title and it's id
                  for (var j = category.sections[i].fields.length - 1; j >= 0; j--) {
                    updateFieldsIds[category.sections[i].fields[j].title] = category.sections[i].fields[j].id;
                  }
                }
              }

              // now we update our array of fields with the new ids
              for (var x = $scope.category.sections.length - 1; x >= 0; x--) {
                var section = $scope.category.sections[x];

                if (section.location === true) {
                  section.id = updateSectionId;

                  for (var z = section.fields.length - 1; z >= 0; z--) {
                    section.fields[z].id = updateFieldsIds[section.fields[z].title];
                  }
                }
              }

              return InventoriesCategoriesService
                .updateForm(category.id, formattedFormData)
                .then(function () {
                    $scope.showMessage('ok', 'A categoria de inventário foi criada com sucesso', 'success', true);

                    InventoriesCategoriesService.purgeCache();

                    $state.go('items.categories.edit', {id: category.id});
                });
            })
            .catch(function (errors) {
              var errIndex = _.first(_.keys(errors));
              var errValue = _.first(_.values(errors)[0]);
              var errorMessage = errIndex.charAt(0).toUpperCase() + errIndex.slice(1) + ' ' + errValue;

              $scope.showMessage(
                'exclamation-sign',
                errorMessage,
                'error',
                true
              );

              $scope.processingForm = false;
            });
        }
      });
    };

    // triggers
    if (formulasResponse) {
      $scope.triggers = formulasResponse.data;
    } else {
      $scope.triggers = [];
    }

    $scope.onlyActiveTriggers = function (item) {
      return !(!_.isUndefined(item._destroy) && item._destroy == true);
    };

    $scope.newTrigger = function () {
      var newTrigger = {
        conditions: [{inventory_field_id: null, operator: 'equal_to', content: null}], // jshint ignore:line
        inventory_status_id: null,
        isNew: true
      };

      $scope.triggers.push(newTrigger);
    };

    $scope.shouldShowGlobalOption = function() {
      return ($rootScope.hasPermission('manage_namespaces') && !updating && $rootScope.namespace.id !== 1);
    };

    $scope.resetSearchInput = function($select){
      $select.search = '';
    };

    function _initialize() {
      $document.on('click', function (event) {
        var el = $(event.target);
        if (!el[0].hasAttribute('has-popover')
          && !el[0].hasAttribute('uis-transclude-append')
          && !(el.closest('.popover').length > 0)
          && !(el.closest('.ui-select-choices-row-inner').length > 0)
          && !(el.closest('.ui-select-match-item').length > 0)
          && !el.hasClass('ui-select-choices-row-inner')
          && !(el.hasClass('ui-select-choices-row'))) {

          $scope.$emit('hidePopovers', true);
        }
      });
    }

    _initialize();
  }
})(angular, $);

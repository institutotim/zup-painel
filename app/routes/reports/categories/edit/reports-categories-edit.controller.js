(function (angular, _) {
  'use strict';

  angular
    .module('ReportsCategoriesEditControllerModule', [
      'FormatErrorsHelperModule',
      'NgThumbComponentModule',
      'SelectListComponentModule',
      'MultipleSelectListComponentModule',
      'ReportsCategoriesManageStatusesModalControllerModule',
      'ReportsCategoriesServiceModule',
      'ReportsCategoriesNotificationsLayoutControllerModule',
      'DisplayNotificationDirectiveModule',
      'ReportsPerimetersServiceModule',
      'CustomFieldsEditorDirectiveModule',
      'ReportsCategoryEditPerimeterModalControllerModule'
    ])

    .factory('NotificationTypesService', NotificationTypesService)
    .controller('ReportsCategoriesEditController', ReportsCategoriesEditController);

  NotificationTypesService.$inject = [
    'Restangular',
    '$q'
  ];
  function NotificationTypesService(Restangular, $q) {

    function NotificationTypesService() {

      var self = this;

      self.notificationTypesMap = {};

      self.cleanCache = function () {
        self.notificationTypesMap = {};
      };

      self.updateCache = function (categoryId, notificationTypes) {
        self.notificationTypesMap[categoryId] = notificationTypes;
      };

      self.getNotificationTypesArrayForCategory = function (categoryId) {

        var deferred = $q.defer();

        if (self.notificationTypesMap[categoryId]) {
          deferred.resolve(self.notificationTypesMap[categoryId]);
        } else {
          Restangular.one('reports')
            .one('categories', categoryId)
            .all('notification_types')
            .getList({return_fields: 'id,category.id,status.id,order,title,default_deadline_in_days,layout,active,created_at,updated_at'})
            .then(function (r) {
              self.updateCache(categoryId, r.data);
              deferred.resolve(r.data);
            }, function (r) {
              deferred.reject(r);
            });
        }

        return deferred.promise;
      };

      self.saveNotificationType = function (categoryId, notificationType) {
        return Restangular
          .one('reports')
          .one('categories', categoryId)
          .withHttpConfig({treatingErrors: true})
          .post('notification_types', notificationType);
      };

      self.updateNotificationType = function (categoryId, notificationType) {
        return Restangular
          .one('reports')
          .one('categories', categoryId)
          .one('notification_types', notificationType.id)
          .withHttpConfig({treatingErrors: true})
          .customPUT(notificationType);
      };

      self.deleteNotificationType = function (categoryId, notificationType) {
        return Restangular
          .one('reports')
          .one('categories', categoryId)
          .one('notification_types', notificationType.id)
          .remove();
      };
    }

    return new NotificationTypesService();
  }

  ReportsCategoriesEditController.$inject = [
    '$scope',
    '$rootScope',
    '$stateParams',
    'NotificationTypesService',
    'Restangular',
    'FileUploader',
    '$q',
    '$location',
    '$modal',
    '$document',
    'reportCategoriesResponse',
    'groupsResponse',
    'notificationsTypesResponse',
    'Error',
    'ReportsCategoriesService',
    '$log',
    'ReportsPerimetersService',
    '$timeout',
    'ReportsCategoryEditPerimeterModalService'
  ];
  function ReportsCategoriesEditController($scope, $rootScope, $stateParams, NotificationTypesService, Restangular, FileUploader, $q, $location, $modal, $document, reportCategoriesResponse, groupsResponse, notificationsTypesResponse, Error, ReportsCategoriesService, $log, ReportsPerimetersService, $timeout, ReportsCategoryEditPerimeterModalService) {
    var updating = $scope.updating = false;
    var categoryId = $scope.categoryId = $stateParams.id;

    $log.debug('ReportsCategoriesEditController created.');
    $scope.$on('$destroy', function () {
      $log.debug('ReportsCategoriesEditController destroyed.');
    });

    if (typeof categoryId !== 'undefined') {
      updating = true;
      $scope.updating = true;
    }

    $scope.mainColors = ['#59B1DF', '#7DDCE2', '#64D2AF', '#5CB466', '#99C450', '#EACD31', '#F3AC2E', '#F18058', '#EF4D3E', '#E984FC', '#A37FE1', '#7A7AF2'];
    $scope.alternativeColors = ['#4383A6', '#5CAFB5', '#4D9F88', '#3E7148', '#73943D', '#AC9827', '#B78226', '#C45C35', '#A23463', '#A938BE', '#7340C1', '#5051BB', '#28344E', '#465366', '#677B86', '#8195A0', '#A0B2BC', '#B9CDD8'];

    // Start loading & get necessary requests
    $scope.loading = true;

    $scope.defaultResolutionTimeSelection = 60;
    $scope.defaultUserResponseTimeSelection = 60;

    var DAY = 60 * 60 * 24, HOUR = 60 * 60, MINUTE = 60;

    var checkTimeFormat = function (timeInSeconds) {
      if (timeInSeconds % DAY == 0) {
        return DAY;
      }
      else if (timeInSeconds % HOUR == 0) {
        return HOUR;
      }
      else {
        return MINUTE;
      }
    };

    /* Perimeters */
    $scope.perimeters = [];
    $scope.perimetersGroupsToRemove = [];

    var loadPerimeters = $scope.loadPerimeters = function () {
      $scope.loading = true;
      ReportsPerimetersService.fetchAll().then(function (r) {
        _.forEach(r, function (perimeter) {
          if (_.isEqual(perimeter.status, 'imported')) {
            $scope.perimeters.push(perimeter);
          }
        });
        $scope.loading = false;
      });
    };

    loadPerimeters();

    $scope.showPerimeters = false;

    $scope.perimetersLimit = 5;

    var getTxtForId = function (list, keyName, valueName, key) {
      var value = _.find(list, function (_val) {
        return _.isEqual(_val[keyName], key);
      });
      return value ? value[valueName] : 'Não disponível';
    };

    $scope.getPerimeterTitle = function (perimeterId) {
      return getTxtForId($scope.perimeters, 'id', 'title', perimeterId);
    };

    $scope.getGroupTitle = function (groupId) {
      return getTxtForId($scope.groups, 'id', 'name', groupId);
    };

    $scope.addNewPerimeterGroup = function () {
      var newPerimeterGroup = {};
      newPerimeterGroup.active = true;
      newPerimeterGroup.category_id = categoryId;

      ReportsCategoryEditPerimeterModalService.open(newPerimeterGroup)
        .then(function (result) {
          $scope.perimetersGroups.push(result);
        });
    };

    $scope.changePerimetersDelay = function () {
      $timeout(function () {
        $scope.showPerimeters = $scope.category.perimeters;
      }, 1000);
    };

    $scope.updatePerimetersLimit = function () {

      if ($scope.perimetersLimit < $scope.perimetersGroups.length) {
        $scope.perimetersLimit += 5;
      } else {
        $scope.perimetersLimet = $scope.perimetersGroups.length;
      }
    };

    $scope.removePerimeterGroup = function (perimeterGroup) {

      // Perimeters groups queue to remove
      if (perimeterGroup.id) {
        $scope.perimetersGroupsToRemove.push(perimeterGroup);
      }

      $scope.perimetersGroups.splice($scope.perimetersGroups.indexOf(perimeterGroup), 1);

    };

    $scope.reportCategories = reportCategoriesResponse.data;
    $scope.groups = groupsResponse.data;
    $scope.notificationTypesArray = [];

    /* Notifications */
    var fillNotificationTypes = function () {
      for (var i = 0; i < $scope.notificationTypesArray.length; i++) {
        var _notificationType = $scope.notificationTypesArray[i];
        var _status = _notificationType.status;
        if (_status) {
          _notificationType.reports_status_id = _status.id;
        }
        if (!_notificationType.order) {
          _notificationType.order = i;
        }
      }

      $scope.notificationTypesArray.sort(function (a, b) {
        return a.order > b.order;
      });
    };

    var refreshNotificationTypesArray = function () {
      NotificationTypesService.cleanCache();
      NotificationTypesService.getNotificationTypesArrayForCategory(categoryId).then(function (r) {
        $scope.notificationTypesArray = r;
        fillNotificationTypes();
      });
    };

    $scope.prepareToDeleteNotificationType = function (notificationType) {
      $scope.notificationTypeToDelete = notificationType;
    };

    $scope.prepareToDisplayNotification = function (notificationType) {
      $scope.notificationContentToDisplay = notificationType.layout;
    };

    $scope.deleteNotificationType = function (notificationType) {
      $scope.deleteNotificationTypePromise = NotificationTypesService
        .deleteNotificationType(categoryId, notificationType)
        .then(function () {
          $scope.showMessage('ok', 'O tipo de notificacao foi removido com sucesso', 'success', true);
          $scope.notificationTypesArray.splice($scope.notificationTypesArray.indexOf(notificationType), 1);
        });
    };

    $scope.notificationsSortableOptions = {
      handle: '.move',
      stop: function (e, ui) {
        $scope.notificationOrderArray = [];
        for (var i = 0; i < $scope.notificationTypesArray.length; i++) {
          $scope.notificationOrderArray[$scope.notificationTypesArray[i].id] = i;
        }
      },
      start: function (e, ui) {
        ui.placeholder.height(ui.item.height());
      },
      tolerance: 'pointer',
      items: 'li',
      revert: true,
      placeholder: 'ui-sortable-placeholder-notification-type'
    };

    $scope.editingNotificationType = false;
    $scope.editingNotificationTypeId = '';
    $scope.addingNotificationType = false;

    $scope.addNotificationType = function () {
      $scope.addingNotificationType = true;
      var newNotificationType = {};
      newNotificationType.order = $scope.notificationTypesArray.length;
      newNotificationType.title = 'Novo tipo de notificação';
      newNotificationType.id = undefined;
      newNotificationType.reports_category_id = categoryId;
      $scope.notificationTypesArray[newNotificationType.order] = newNotificationType;
      $scope.editNotificationType(newNotificationType);
    };

    $scope.editNotificationType = function (notificationType) {
      $scope.dirtyNotificationType = false;
      $scope.notificationTypeOriginator = notificationType;
      $scope.notificationTypeMemento = angular.copy(notificationType);
      $scope.editingNotificationTypeId = notificationType.id;
      $scope.editingNotificationType = true;
    };

    $scope.verifyDirtyNotificationTypeMemento = function (notificationType) {
      $scope.notificationTypeMemento.default_deadline_in_days = parseInt($scope.notificationTypeMemento.default_deadline_in_days, 10);
      var sameValues = angular.equals(notificationType, $scope.notificationTypeMemento);
      $scope.dirtyNotificationType = sameValues ? false : true;
    };

    var sucessPostPutPromise = function (sucessMsg) {
      $scope.showMessage('ok', sucessMsg, 'success', true);
    };

    var errorPostPutPromise = function (response, errorMsg) {
      $scope.showMessage('exclamation-sign', errorMsg, 'error', true);
      if (typeof response.data.error !== 'object') {
        Error.show(response);
      } else {
        $scope.inputErrors = response.data.error;
      }
    };

    $scope.updateEditingNotificationType = function (notificationType) {
      $scope.inputErrors = null;
      notificationType.title = $scope.notificationTypeMemento.title;
      notificationType.reports_status_id = $scope.notificationTypeMemento.reports_status_id;
      notificationType.default_deadline_in_days = $scope.notificationTypeMemento.default_deadline_in_days;
      notificationType.layout = $scope.notificationTypeMemento.layout;
      $scope.saveNotificationTypePromise = undefined;
      if ($scope.addingNotificationType) {
        $scope.saveNotificationTypePromise = NotificationTypesService
          .saveNotificationType(categoryId, notificationType)
          .then(function () {
            resetNotificationTypesFlags();
            $scope.addingNotificationType = false;
            sucessPostPutPromise('O tipo de notificação foi criado com sucesso');
            refreshNotificationTypesArray();
            $scope.saveNotificationTypePromise = undefined;
          }, function (r) {
            errorPostPutPromise(r, 'O tipo de notificação não pode ser salvo');
            $scope.saveNotificationTypePromise = undefined;
          });
      } else {
        $scope.saveNotificationTypePromise = NotificationTypesService
          .updateNotificationType(categoryId, notificationType)
          .then(function () {
            resetNotificationTypesFlags();
            $scope.addingNotificationType = false;
            sucessPostPutPromise('O tipo de notificação foi atualizado com sucesso');
            refreshNotificationTypesArray();
            $scope.saveNotificationTypePromise = undefined;
          }, function (r) {
            errorPostPutPromise(r, 'O tipo de notificação não pode ser salvo');
            $scope.saveNotificationTypePromise = undefined;
          });
      }
    };

    var resetNotificationTypesFlags = function () {
      $scope.dirtyNotificationType = false;
      $scope.notificationTypeMemento = null;
      $scope.editingNotificationTypeId = null;
      $scope.editingNotificationType = false;
    };

    $scope.cancelEditingNotificationType = function () {
      if ($scope.addingNotificationType) {
        $scope.notificationTypesArray.splice($scope.notificationTypesArray.length - 1, 1);
        $scope.addingNotificationType = false;
      }
      resetNotificationTypesFlags();
    };

    $scope.isEditNotificationType = function (notificationType) {
      return $scope.editingNotificationTypeId === notificationType.id;
    };

    $scope.isDirtyNotificationType = function (notificationType) {
      return $scope.isEditNotificationType(notificationType) && $scope.dirtyNotificationType;
    };

    $scope.editNotificationTypeLayout = function (notificationType) {
      $modal.open({
        templateUrl: 'modals/reports/categories/notifications/reports-categories-notifications-layout.template.html',
        windowTemplateUrl: 'modals/reports/categories/notifications/reports-categories-notifications-layout-modal.template.html',
        backdrop: false,
        resolve: {
          notificationType: function () {
            return notificationType;
          },
          parentScope: function () {
            return $scope;
          }
        },
        controller: 'ReportsCategoriesNotificationsLayoutController',
        navigateWithoutLoading: '/layout-modal'
      });
    };

    var categoriesPromise = Restangular.one('inventory').all('categories').getList({return_fields: 'id,title'}), category;

    function _loadPerimeterGroups() {
      var defer = $q.defer();
      var perimetersPromise = ReportsPerimetersService.getPerimetersGroups(categoryId);
      perimetersPromise.then(function (perimeterGroups) {
        $scope.perimetersGroups = perimeterGroups;
        defer.resolve();
      });

      perimetersPromise.catch(defer.reject);

      return defer.promise;
    }

    if (updating) {
      // We create a empty category object to be passed on PUT
      category = $scope.category = {};

      var categoryPromise = Restangular.one('reports').one('categories', categoryId).get();

      $q.all([categoriesPromise, categoryPromise, _loadPerimeterGroups()]).then(function (responses) {
        $scope.categories = responses[0].data;

        // ...and we populate $scope.category with the data from the server =)
        _.extend(category, responses[1].data);

        category.statuses = _.map(responses[1].data.statuses, function (status) {
          if (status.flow) {
            status.flow_id = status.flow.id;
            status.flow_title = status.flow.title;
          }

          return status;
        });

        if (!category.solver_groups_ids) {
          category.solver_groups_ids = [];
        }
        if (category.default_solver_group) {
          category.default_solver_group_id = category.default_solver_group.id;
        }
        if (category.default_solver_group_id && category.solver_groups_ids.length == 0) {
          category.solver_groups_ids.push(category.default_solver_group_id);
        }
        category.solver_groups = getSolverGroups($scope.groups, category.solver_groups_ids);

        $scope.showPerimeters = category.perimeters = responses[1].data.perimeters;

        NotificationTypesService.updateCache(categoryId, notificationsTypesResponse.data);
        $scope.notificationTypesArray = notificationsTypesResponse.data;
        fillNotificationTypes();

        if (responses[1].data.user_response_time !== null) // jshint ignore:line
        {
          $scope.enabledUserResponseTime = true;
          category.user_response_time = responses[1].data.user_response_time; // jshint ignore:line

          $scope.defaultUserResponseTimeSelection = checkTimeFormat(category.user_response_time);
          $scope.preferedUserResponseTime = category.user_response_time / $scope.defaultUserResponseTimeSelection;
        }

        if (responses[1].data.resolution_time !== null) // jshint ignore:line
        {
          // ...and convert resolution_time to minutes
          category.resolution_time = responses[1].data.resolution_time; // jshint ignore:line

          $scope.defaultResolutionTimeSelection = checkTimeFormat(category.resolution_time);
          $scope.preferedResolutionTime = category.resolution_time / $scope.defaultResolutionTimeSelection;
        }

        category.inventory_categories = []; // jshint ignore:line

        /* jshint ignore:start */
        if (typeof responses[1].data.inventory_categories == 'object' && responses[1].data.inventory_categories.length !== 0) {
          for (var i = responses[1].data.inventory_categories.length - 1; i >= 0; i--) {
            category.inventory_categories.push(responses[1].data.inventory_categories[i].id);
          }
        }
        /* jshint ignore:end */

        $scope.icon = responses[1].data.original_icon; // jshint ignore:line

        $scope.loading = false;
      });
    } else {
      categoriesPromise.then(function (response) {
        $scope.categories = response.data;

        $scope.loading = false;
      });

      $scope.perimetersGroups = [];

      $scope.enabledUserResponseTime = false;

      // We create a default
      category = $scope.category = {
        marker: 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        inventory_categories: [], // jshint ignore:line
        allows_arbitrary_position: true, // jshint ignore:line
        color: '#2AB4DC',
        solver_groups_ids: [],
        default_solver_group_id: null,
        statuses: [
          {
            'title': 'Em andamento',
            'color': '#f8b01d',
            'initial': false,
            'final': false,
            'active': true,
            'created_at': '2014-03-05T01: 12: 34.181-03: 00',
            'updated_at': '2014-03-05T01: 12: 34.181-03: 00',
            'private': false
          },
          {
            'title': 'Resolvidas',
            'color': '#78c953',
            'initial': false,
            'final': true,
            'active': true,
            'created_at': '2014-03-05T01: 12: 34.195-03: 00',
            'updated_at': '2014-03-05T01: 12: 34.195-03: 00',
            'private': false
          },
          {
            'title': 'Não resolvidas',
            'color': '#999999',
            'initial': false,
            'final': true,
            'active': true,
            'created_at': '2014-03-05T01: 12: 34.200-03: 00',
            'updated_at': '2014-03-05T01: 12: 34.200-03: 00',
            'private': false
          },
          {
            'title': 'Em aberto',
            'color': '#ff0000',
            'initial': true,
            'final': false,
            'active': true,
            'created_at': '2014-03-17T22: 52: 50.365-03: 00',
            'updated_at': '2014-03-17T22: 52: 50.365-03: 00',
            'private': false
          }
        ],
        notifications: false
      };
    }

    // Image uploader
    var uploader = $scope.uploader = new FileUploader();

    // Images only
    uploader.filters.push({
      name: 'onlyImages',
      fn: function (item, options) {
        var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
        type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    $scope.pickColor = function (color) {
      $scope.category.color = color;
    };

    $scope.pickIcon = function (icon) {
      $scope.selectedIcon = icon;
      uploader.queue = [];
    };

    $scope.filterByIds = function (item) {
      return (_.isUndefined(category.solver_groups_ids) || !~category.solver_groups_ids.indexOf(item.id)) ? false : true;
    };

    $scope.categoriesAutocomplete = {
      options: {
        source: function (request, uiResponse) {
          var categoriesPromise = Restangular.one('search').one('inventory').all('categories').getList({
            title: request.term,
            return_fields: 'id,title'
          });

          categoriesPromise.then(function (response) {
            uiResponse($.map(response.data, function (item) {
              return {
                label: item.title,
                value: item.title,
                id: item.id
              };
            }));
          });
        },
        select: function (event, ui) {
          $scope.addCategory(ui.item.id);
        },
        messages: {
          noResults: '',
          results: function () {
          }
        }
      }
    };

    $scope.addCategory = function (id) {
      if (!~category.inventory_categories.indexOf(id)) {
        category.inventory_categories.push(id); // jshint ignore:line
      }
    };

    $scope.removeCategory = function (id) {
      category.inventory_categories.splice(category.inventory_categories.indexOf(id), 1); // jshint ignore:line
    };

    var getSolverGroups = function (groups, solvers) {
      return _.filter(groups, function (group) {
        return _.contains(solvers, group.id)
      });
    };

    $scope.$watchCollection('category.solver_groups_ids', function (newValue, oldValue) {
      if (!_.isEqual(newValue, oldValue)) {
        $scope.category.solver_groups = getSolverGroups($scope.groups, newValue);
        if (_.isEmpty(newValue)) {
          $scope.category.default_solver_group_id = null;
          $scope.category.default_solver_group = null;
        }
      }
    });

    $scope.manageStatuses = function () {
      $modal.open({
        templateUrl: 'modals/reports/categories/manage-statuses/reports-categories-manage-statuses.template.html',
        windowClass: 'manageStatuses',
        resolve: {
          category: function () {
            return $scope.category;
          },
          updating: function () {
            return updating;
          },
          categoryId: function () {
            return categoryId;
          }
        },
        controller: 'ReportsCategoriesManageStatusesModalController'
      });
    };

    $scope.$watch('preferedResolutionTime', function () {
      category.resolution_time = $scope.preferedResolutionTime * $scope.defaultResolutionTimeSelection;
    });

    $scope.changeDefaultResolutionTimeSelection = function (seconds) {
      $scope.preferedResolutionTime = Math.round(category.resolution_time / seconds);
      $scope.defaultResolutionTimeSelection = seconds;
    };

    $scope.$watch('preferedUserResponseTime', function () {
      category.user_response_time = $scope.preferedUserResponseTime * $scope.defaultUserResponseTimeSelection;
    });

    $scope.changeDefaultUserResponseTimeSelection = function (seconds) {
      $scope.preferedUserResponseTime = Math.round(category.user_response_time / seconds);
      $scope.defaultUserResponseTimeSelection = seconds;
    };

    $scope.shouldShowGlobalOption = function () {
      return ($scope.hasPermission('manage_namespaces') && !updating && $rootScope.namespace.id !== 1);
    };

    $scope.send = function () {
      $scope.inputErrors = null;
      $rootScope.resolvingRequest = true;
      var promises = [];

      // Add images to queue for processing it's dataUrl
      function addAsync(file) {
        var deferred = $q.defer();

        var picReader = new FileReader();

        picReader.addEventListener('load', function (event) {
          var picFile = event.target;

          var icon = picFile.result.replace(/^data:image\/[^;]+;base64,/, '');
          deferred.resolve(icon);
        });

        // pass as base64 and strip data:image
        picReader.readAsDataURL(file);

        return deferred.promise;
      }

      // if our upload queue is empty and we have a selectedIcon, we shall get it's base64 contents
      if (uploader.queue.length == 0 && $scope.selectedIcon) {
        var promise = (function () {
          var deferred = $q.defer();

          var canvas = $document[0].createElement('CANVAS');
          var ctx = canvas.getContext('2d');
          var img = new Image;

          img.crossOrigin = 'Anonymous';

          img.onload = function () {
            canvas.height = img.height;
            canvas.width = img.width;

            ctx.drawImage(img, 0, 0);

            var dataURL = canvas.toDataURL('image/png');

            deferred.resolve(dataURL.replace(/^data:image\/[^;]+;base64,/, ''));

            canvas = null;
          };

          img.src = 'assets/images/icons/' + $scope.selectedIcon + '.png';

          return deferred.promise;
        })();

        promises.push(promise);
      } else {
        for (var i = uploader.queue.length - 1; i >= 0; i--) {
          promises.push(addAsync(uploader.queue[i]._file));
        }
      }

      // wait for images to process as base64
      $q.all(promises).then(function (results) {
        var icon = results[0];

        var editedCategory = angular.copy(category);

        // change category.statuses to acceptable format for the API
        var tempStatuses = editedCategory.statuses;

        editedCategory.statuses = {};

        for (var i = tempStatuses.length - 1; i >= 0; i--) {
          tempStatuses[i].initial = tempStatuses[i].initial.toString();
          tempStatuses[i].final = tempStatuses[i].final.toString();
          tempStatuses[i].active = tempStatuses[i].active.toString();
          tempStatuses[i].private = tempStatuses[i].private.toString();

          editedCategory.statuses[i] = tempStatuses[i];
        }

        // And we convert the user selection to seconds
        editedCategory.resolution_time = editedCategory.resolution_time; // jshint ignore:line

        // also the user feedback time we convert it to seconds
        if (typeof editedCategory.user_response_time !== 'undefined' && editedCategory.user_response_time !== 'null' && $scope.enabledUserResponseTime == true) {
          editedCategory.user_response_time = editedCategory.user_response_time; // jshint ignore:line
        } else {
          editedCategory.user_response_time = null; // jshint ignore:line
        }

        // PUT if updating and POST if creating a new category
        if (updating) {
          if (icon) {
            editedCategory.icon = icon;
          }

          var putCategoryPromise = Restangular.one('reports').one('categories', categoryId).withHttpConfig({treatingErrors: true}).customPUT(editedCategory);

          promises = [];

          promises.push(putCategoryPromise);

          for (var i = $scope.perimetersGroups.length - 1; i >= 0; i--) {
            var currentPerimeterGroup = $scope.perimetersGroups[i];
            if (currentPerimeterGroup.__isDirty && currentPerimeterGroup.__isDirty()) {
              promises.push(ReportsPerimetersService.savePerimeterGroup(currentPerimeterGroup));
            }
          }

          for (var i = $scope.perimetersGroupsToRemove.length - 1; i >= 0; i--) {
            promises.push(ReportsPerimetersService.deletePerimeterGroup($scope.perimetersGroupsToRemove[i]));
          }


          $q.all(promises).then(function (results) {
            ReportsCategoriesService.purgeCache();

            $scope.showMessage('ok', 'A categoria de relato foi atualizada com sucesso', 'success', true);

            $rootScope.resolvingRequest = false;
            for (var i = $scope.perimetersGroups.length - 1; i >= 0; i--) {
              if ($scope.perimetersGroups[i].__resetDirty) {
                $scope.perimetersGroups[i].__resetDirty();
              } else {
                delete $scope.perimetersGroups[i].__isDirty;
              }
            }
            $scope.perimetersGroupsToRemove = [];

            // Set id for created perimeters groups
            _.each(results, function (result) {
              if (_.isEqual('POST', result.config.method) && _.isEqual('perimeters', result.data.route)) {
                var createdPerimeter = _.find($scope.perimetersGroups, function (perimeter) {
                  return _.isNull(perimeter.id) || _.isUndefined(perimeter.id);
                });
                createdPerimeter.id = result.data.id;
              }
            });

          }, function (response) {
            $scope.showMessage('exclamation-sign', 'A categoria de relato não pode ser salva', 'error', true);

            if (typeof response.data.error !== 'object') {
              Error.show(response);
            } else {
              $scope.inputErrors = response.data.error;
            }

            $rootScope.resolvingRequest = false;
          });
        } else {
          editedCategory.icon = icon;
          editedCategory.marker = icon;

          var postCategoryPromise = Restangular.one('reports').withHttpConfig({treatingErrors: true}).post('categories', editedCategory);

          postCategoryPromise.then(function () {
            ReportsCategoriesService.purgeCache();

            $scope.showMessage('ok', 'A categoria de relato foi criada com sucesso', 'success', true);

            $location.path('/reports/categories');

            $rootScope.resolvingRequest = false;
          }, function (response) {
            $scope.showMessage('exclamation-sign', 'A categoria de relato não pode ser salva', 'error', true);

            if (typeof response.data.error !== 'object') {
              Error.show(response);
            } else {
              $scope.inputErrors = response.data.error;
            }

            $rootScope.resolvingRequest = false;
          });
        }
      });
    };

    $scope.statusDecorator = {
      true: ['', 'perimeter-status-ok', 'Ativo'],
      false: ['', 'perimeter-status-process', 'Inativo']
    };

    $scope.editPerimeter = function (perimeter) {
      ReportsCategoryEditPerimeterModalService.open(perimeter)
        .then(function (result) {
          angular.extend(perimeter, result);
        });
    };
  }

})(angular, _);

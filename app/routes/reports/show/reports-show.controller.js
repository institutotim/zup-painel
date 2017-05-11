(function (angular, _) {
  'use strict';

  angular
    .module('ReportsShowControllerModule', [
      'MapShowReportComponentModule',
      'MapStreetViewComponentModule',
      'ReportsEditStatusModalControllerModule',
      'ReportsEditDescriptionModalControllerModule',
      'ReportsEditCategoryModalControllerModule',
      'ReportsSelectAddressModalControllerModule',
      'ReportsForwardModalControllerModule',
      'ReportsSelectUserModalControllerModule',
      'ReportsEditReferenceModalControllerModule',
      'ReportsPrintModalControllerModule',
      'ReportSearchMapComponentModule',
      'MapNewReportComponentModule',
      'NextFieldOnEnterComponentModule',
      'duScroll',
      'ReportsSendNotificationsModalControllerModule',
      'ReportsCategoriesNotificationsServiceModule',
      'ReportsCategoriesServiceModule',
      'ReportsItemsServiceModule',
      'ReportsFeatureFlagsServiceModule',
      'ReportsPhraseologiesServiceModule',
      'ReportsImagesDestroyModalModule',
      'ReportsImagesEditModalModule',
      'ReportsImagesAddModalModule',
      'GalleryModalControllerModule',
      'ckeditor', 'angularLoad',
      'CasesServiceModule'
    ])

    .value('duScrollOffset', 200)
    .controller('ReportsShowController', ReportsShowController);

  ReportsShowController.$inject = [
    '$scope',
    'Restangular',
    '$q',
    '$modal',
    '$window',
    'reportResponse',
    '$state',
    '$rootScope',
    '$log',
    'CasesService',
    'ReportsCategoriesNotificationsService',
    'ReportsCategoriesService',
    'ReportsPhraseologiesService',
    'ReportsItemsService',
    'ReportsFeatureFlagsService',
    'ReportsImagesService',
    'ReportsImagesAddModalService',
    'ReportsImagesEditModalService',
    'ReportsImagesDestroyModalService',
    'GalleryModalService',
    'angularLoad',
    'ENV'
  ];
  function ReportsShowController($scope, Restangular, $q, $modal, $window, reportResponse, $state, $rootScope, $log, CasesService, ReportsCategoriesNotificationsService, ReportsCategoriesService, ReportsPhraseologiesService, ReportsItemsService, ReportsFeatureFlagsService, ReportsImagesService, ReportsImagesAddModalService, ReportsImagesEditModalService, ReportsImagesDestroyModalService, GalleryModalService, angularLoad, ENV) {

    $log.info('ReportsShowController created.');
    $scope.$on('$destroy', function () {
      $log.info('ReportsShowController destroyed.');
    });

    $scope.report = reportResponse.data;

    // Normalize returned cases
    if ($scope.report.related_entities.cases) {
      $scope.report.related_entities.cases = _.map($scope.report.related_entities.cases, function(kase) {
        return CasesService.denormalizeCase(kase);
      });
    }

    if ($scope.report.status) {
      $scope.report.status_id = $scope.report.status.id; // jshint ignore:line
    }
    $scope.categoryData = $scope.report.category;
    $scope.report.custom_fields = _.map($scope.report.category.custom_fields, function(field){
      if($scope.report.custom_fields[field.id]) {
        field.value = $scope.report.custom_fields[field.id];
      }
      return field;
    });
    $scope.images = [];

    if ($scope.report.position) {
      $scope.lat = $scope.report.position.latitude; // Please fix this mess whenever possible #TODO
      $scope.lng = $scope.report.position.longitude;
    } else {
      $scope.lat = null;
      $scope.lng = null;
    }

    function _parseCommentUrls(comment) {
      var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
        matches = _.uniq((comment.message || '').match(regex));

      _.each(matches, function (url) {
        comment.message = comment.message.replace(url, '[' + url + '](' + url + ')');
      });
      return comment;
    }

    // Fetch comments
    Restangular.one('reports', $scope.report.id).all('comments').getList({
      return_fields: 'id,created_at,message,visibility,author.id,author.name'
    }).then(function (response) {
      $scope.comments = _.map(response.data, _parseCommentUrls);
    });

    // Fetch feedback
    Restangular.one('reports', $scope.report.id).one('feedback').get({
      return_fields: 'id,kind,content,images'
    }).then(function (response) {
      $scope.feedback = response.data;
    });

    // Fetch phraseologies
    ReportsPhraseologiesService.fetchAll({
      display_type: 'full',
      return_fields: 'title,description',
      grouped: true
    }).then(function (phraseologies) {
      $scope.phraseologies = _.pick(phraseologies, function (value, key) {
        return (key === '') || (value[0].reports_category_id === $scope.report.category.id);
      });
    });

    ReportsFeatureFlagsService.getFeatureFlags().then(function (response) {
      ReportsFeatureFlagsService.convertFeaturesFlagsFrom(response.data).and().addInto($scope)
    });

    // Fetch group items
    var _fetchGroupItems = function () {
      if ($scope.report.grouped) {
        $scope.loadingGroupedReports = true;
        Restangular.one('reports').one('items', $scope.report.id).all('group')
          .getList()
          .then(function (res) {
            $scope.loadingGroupedReports = false;
            if (res.status !== 200) {
              $rootScope.showMessage('exclamation-sign', 'Erro ao carregar relatos agrupados', 'error', false);
              return $scope.report.grouped = false;
            }
            $scope.report.grouped_items = res.data;
          });
      }
    };

    _fetchGroupItems();

    $scope.newUserResponse = {message: null, privateComment: true, typing: false};
    $scope.newSystemComment = {message: null, typing: false};

    $scope.filterByUserMessages = function (comment) {
      return (comment.visibility === 0 || comment.visibility === 1);
    };

    var sendComment = function (message, visibility) {
      return Restangular.one('reports', $scope.report.id)
        .customPOST({
          message: message, replicate: !!$scope.report.replicate,
          visibility: visibility,
          return_fields: 'id,created_at,message,visibility,author.id,author.name'
        }, 'comments');
    };

    $scope.submitUserResponse = function () {
      $scope.processingComment = true;

      var visibility = 0;

      if ($scope.newUserResponse.privateComment) visibility = 1;

      var postCommentResponse = sendComment($scope.newUserResponse.message, visibility);

      postCommentResponse.then(function (response) {
        $scope.newUserResponse.message = null;
        $scope.processingComment = false;

        $scope.comments.push(_parseCommentUrls(response.data));

        $scope.refreshHistory();
      });
    };

    $scope.submitSystemComment = function () {
      $scope.processingSystemComment = true;

      var postCommentResponse = sendComment($scope.newSystemComment.message, 2);

      postCommentResponse.then(function (response) {
        $scope.processingSystemComment = false;
        $scope.newSystemComment.message = null;

        $scope.comments.push(response.data);

        $scope.refreshHistory();
      });
    };

    $scope.editCategory = function () {
      $rootScope.resolvingRequest = true;

      $modal.open({
        templateUrl: 'modals/reports/edit-category/reports-edit-category.template.html',
        windowClass: 'report-edit-category-modal',
        resolve: {
          report: function () {
            return $scope.report;
          },

          category: function () {
            return $scope.report.category;
          },

          categories: function () {
            return Restangular.all('reports').all('categories').getList({
              'display_type': 'full',
              'return_fields': 'id,title,subcategories.id,subcategories.title'
            });
          }
        },
        controller: 'ReportsEditCategoryModalController'
      });
    };

    $scope.editReportStatus = function (report, category) {
      $rootScope.resolvingRequest = true;

      $modal.open({
        templateUrl: 'modals/reports/edit-status/reports-edit-status.template.html',
        windowClass: 'editStatusModal',
        resolve: {
          report: function () {
            return report;
          },

          category: function () {
            return category;
          },

          statusesResponse: function () {
            return Restangular.one('reports').one('categories', $scope.report.category.id).all('statuses').getList();
          }
        },
        controller: 'ReportsEditStatusModalController'
      });
    };

    var addressFields = ['address', 'number', 'city', 'postal_code', 'reference', 'state', 'country', 'district'];
    var currentLat = $scope.lat, currentLng = $scope.lng;
    $scope.editAddress = function () {
      $scope.editingAddress = true;
      currentLat = $scope.lat;
      currentLng = $scope.lng;
      $scope.address = {};
      _.each(addressFields, function (ac) {
        $scope.address[ac] = $scope.report[ac];
      });
      $scope.address.number = parseInt($scope.address.number, 10); // TODO upgrade to angular 1.4
    };

    $scope.cancelAddressEdit = function () {
      $scope.editingAddress = false;
      $scope.lat = currentLat;
      $scope.lng = currentLng;
    };

    $scope.saveAddress = function (addressForm) {
      addressForm.$submitted = true;
      if (addressForm.$valid) {
        $scope.savingAddress = true;

        var updateAddressRequest = {
          latitude: $scope.lat,
          longitude: $scope.lng,
          return_fields: 'position.latitude,position.longitude,address,number,reference,district,postal_code,state,city,assigned_group.id,assigned_group.name,perimeter'
        };

        _.each(addressFields, function (field) {
          updateAddressRequest[field] = addressForm[field].$viewValue
        });

        var updateReportAddressPromise = Restangular.one('reports', $scope.report.category.id)
          .one('items', $scope.report.id).customPUT(updateAddressRequest);

        updateReportAddressPromise.then(function (response) {
          var updatedReportFields = response.data;
          $scope.showMessage('ok', 'O endereço do relato foi alterado com sucesso.', 'success', true);
          $scope.loading = $scope.savingAddress = $scope.editingAddress = false;
          $scope.report.position = updatedReportFields.position;
          $scope.lat = $scope.report.position.latitude;
          $scope.lng = $scope.report.position.longitude;
          _.each(addressFields, function (field) {
            $scope.report[field] = updatedReportFields[field]
          });
          $scope.report['assigned_group'] = updatedReportFields['assigned_group'];
          $scope.report['perimeter'] = updatedReportFields['perimeter'];
          $scope.refreshHistory();
        });
      }
    };

    $scope.editDescription = function () {
      $modal.open({
        templateUrl: 'modals/reports/edit-description/reports-edit-description.template.html',
        windowClass: 'editReportModal',
        resolve: {
          report: function () {
            return $scope.report;
          },

          refreshHistory: function () {
            return $scope.refreshHistory;
          }
        },
        controller: 'ReportsEditDescriptionModalController'
      });
    };

    $scope.editCustomField = function (field) {
      $modal.open({
        templateUrl: 'modals/reports/edit-custom-field/reports-edit-custom-field.template.html',
        windowClass: 'editReportModal',
        resolve: {
          field: function () {
            return field;
          },

          report: function () {
            return $scope.report;
          }
        },
        controller: 'ReportsEditCustomFieldModalController'
      });
    };

    $scope.editReference = function () {
      $modal.open({
        templateUrl: 'modals/reports/edit-reference/reports-edit-reference.template.html',
        windowClass: 'editReportModal',
        resolve: {
          report: function () {
            return $scope.report;
          },
          parentScope: function () {
            return $scope;
          }
        },
        controller: 'ReportsEditReferenceModalController'
      });
    };

    $scope.forwardReport = function () {
      $rootScope.resolvingRequest = true;

      $modal.open({
        templateUrl: 'modals/reports/forward/reports-forward.template.html',
        windowClass: 'reports-forward-modal',
        resolve: {
          report: function () {
            return $scope.report;
          },

          category: function () {
            return $scope.report.category;
          },

          groupsResponse: function () {
            return Restangular.all('groups').getList({return_fields: 'id,name'});
          }
        },
        controller: 'ReportsForwardModalController'
      });
    };

    $scope.assignReport = function () {
      $modal.open({
        templateUrl: 'modals/reports/select-user/reports-select-user.template.html',
        windowClass: 'modal-reports-select-user',
        resolve: {
          setUser: ['Restangular', '$state', '$rootScope', function (Restangular, $state, $rootScope) {
            return function (user, replicate) {
              $rootScope.resolvingRequest = true;

              var changeStatusPromise = Restangular.one('reports', $scope.report.category.id).one('items', $scope.report.id).one('assign').customPUT({
                'user_id': user.id, 'replicate': !!replicate,
                'return_fields': ''
              });

              changeStatusPromise.then(function () {
                $rootScope.resolvingRequest = false;

                $scope.showMessage('ok', 'O usuário responsável foi alterado com sucesso.', 'success', true);
                $state.go($state.current, {}, {reload: true});
              });
            };
          }],

          filterByGroup: function () {
            return $scope.report.assigned_group.id;
          },

          report: function () {
            return $scope.report;
          }
        },
        controller: 'ReportsSelectUserModalController'
      });
    };

    $scope.print = function () {
      $modal.open({
        templateUrl: 'modals/reports/print/reports-print.template.html',
        windowClass: 'filterCategoriesModal',
        resolve: {
          openModal: function () {
            return function (options) {
              $window.open('#/reports/' + $scope.report.id + '/print?sections=' + options.join(), 'ZUP Imprimir relato', 'height=800,width=850');
            }
          }
        },
        controller: 'ReportsPrintModalController'
      });
    };

    // report's history
    $scope.refreshHistory = function () {
      var options = {
        return_fields: 'changes,created_at,kind,user.id,user.name,action'
      };

      var selectedFilters = $scope.selectedFilters();

      if (selectedFilters.length !== 0) {
        options.kind = selectedFilters.join();
      }

      if ($scope.historyFilterBeginDate) {
        options['created_at[begin]'] = $scope.historyFilterBeginDate;
      }

      if ($scope.historyFilterEndDate) {
        options['created_at[end]'] = $scope.historyFilterEndDate;
      }

      $scope.loadingHistoryLogs = true;

      var historyPromise = Restangular.one('reports').one('items', $scope.report.id).one('history').getList(null, options);

      historyPromise.then(function (historyLogs) {
        $scope.historyLogs = historyLogs.data;

        // Resolve o texto de estado para mensagem de atraso
        var nextStatus = false;
        for (var i = 0, l = $scope.historyLogs.length; i < l; i++) {
          var log = $scope.historyLogs[i];
          var kind = log.kind;
          if (kind === 'overdue') {
            nextStatus = true;
            continue;
          }
          if (nextStatus && (kind === 'status' || kind === 'creation')) {
            $scope.overdue_status = log.changes.new.title;
            break;
          }
        }

        $scope.loadingHistoryLogs = false;
      });
    };

    $scope.historyOptions = {
      type: undefined
    };

    $scope.availableHistoryFilters = [
      {type: 'category', name: 'Categoria', selected: false},
      {type: 'status', name: 'Estados', selected: false},
      {type: 'address', name: 'Endereço', selected: false},
      {type: 'description', name: 'Descrição', selected: false},
      {type: 'category', name: 'Categoria', selected: false}
    ];

    $scope.availableHistoryDateFilters = [
      {
        name: 'Hoje',
        beginDate: moment().startOf('day').format(),
        endDate: moment().endOf('day').format(),
        selected: false
      },
      {
        name: 'Ontem',
        beginDate: moment().subtract(1, 'days').startOf('day').format(),
        endDate: moment().subtract(1, 'days').endOf('day').format(),
        selected: false
      },
      {
        name: 'Este mês',
        beginDate: moment().startOf('month').format(),
        endDate: moment().subtract(1, 'days').endOf('day').format(),
        selected: false
      },
      {
        name: 'Mês passado',
        beginDate: moment().subtract(1, 'months').startOf('month').format(),
        endDate: moment().subtract(1, 'months').subtract(1, 'days').endOf('day').format(),
        selected: false
      },
      {name: 'Todos', beginDate: null, endDate: null, selected: true}
    ];

    $scope.selectedFilters = function () {
      var filters = [];

      _.each($scope.availableHistoryFilters, function (filter) {
        if (filter.selected) filters.push(filter.type);
      });

      return filters;
    };

    $scope.toggleOption = function (option) {
      option.selected = !option.selected;

      $scope.refreshHistory();
    };

    var lastAddress = $scope.report.address, lastNumber = $scope.report.number;
    var wasPositionUpdated = false;
    $scope.fieldOnEnter = function (previousField) {
      if (previousField.name == 'address' || $scope.address.address == '' || $scope.address.number == '') {
        wasPositionUpdated = false;
        return;
      }
      if ($scope.address.address != lastAddress || $scope.address.number != parseInt(lastNumber, 10)) {
        wasPositionUpdated = true;
        lastAddress = $scope.address.address;
        lastNumber = $scope.address.number;
        $scope.$broadcast('addressChanged');
      }
    };

    $scope.$on('reports:position-updated', function (e, location) {
      $scope.lat = location.lat();
      $scope.lng = location.lng();
      if (!wasPositionUpdated) {
        $scope.$broadcast('addressChanged', true);
      }
    });

    $scope.resetHistoryFilters = function () {
      _.each($scope.availableHistoryFilters, function (filter) {
        filter.selected = true;
      });

      $scope.refreshHistory();
    };

    $scope.showCustomDateFields = function () {
      _.each($scope.availableHistoryDateFilters, function (filter) {
        filter.selected = false;
      });

      $scope.showCustomDateHelper = true;
    };

    $scope.selectDateFilter = function (filter) {
      _.each($scope.availableHistoryDateFilters, function (filter) {
        filter.selected = false;
      });

      filter.selected = !filter.selected;

      $scope.historyFilterBeginDate = filter.beginDate;
      $scope.historyFilterEndDate = filter.endDate;

      $scope.showCustomDateHelper = false;

      $scope.refreshHistory();
    };

    $scope.historyLogs = [];

    $scope.refreshHistory();

    // Notifications
    // Fetch notifications

    $scope.canSendNotifications = $scope.report.category.notifications &&
      $rootScope.hasAnyPermission(['reports_items_restart_notification',
        'reports_items_send_notification',
        'reports_full_access',
        'reports_categories_edit',
        'reports_items_edit']);

    $scope.notifications = $scope.report.notifications;

    $scope.reloadNotifications = function () {
      var reloadNotificationsFields = ['status', 'notifications.notification_type.title', 'notifications.notification_type.default_deadline_in_days', 'notifications.created_at', 'notifications.days_to_deadline',
        'notifications.content', 'notifications.active'];
      Restangular.one('reports').one('items', $scope.report.id).get({'return_fields': reloadNotificationsFields.join()}).then(function (r) {
        $scope.notifications = r.data.notifications;
      });
    };

    $scope.scriptLoaded = false;

    angularLoad.loadScript(ENV.ckeditorPath).then(function () {
      $scope.scriptLoaded = true;
    });

    function daysLiteral(days) {
      var abs = Math.abs(days);
      return abs + (abs === 1 ? ' dia' : ' dias');
    }

    $scope.getDaysTxt = function (days) {
      return days < 0 ? (daysLiteral(days) + ' atrás') : (days === 0 ? 'Encerrado' : daysLiteral(days));
    };

    $scope.showNotificationsModal = function () {

      $modal.open({
        templateUrl: 'modals/reports/notifications/reports-notifications-modal.template.html',
        windowClass: 'reports-notifications-modal',
        backdrop: 'static',
        resolve: {
          report: function () {
            return $scope.report;
          },
          notifications: function () {
            $scope.retrieveNotificationsPromise = ReportsCategoriesNotificationsService.getAvailableNotificationsForReport($scope.report.id, $scope.report.category.id);
            return $scope.retrieveNotificationsPromise;
          },
          parentScope: function () {
            return $scope;
          }
        },
        controller: 'ReportsSendNotificationsModalController'
      });
    };

    $scope.ungroupReport = function (report_id) {
      if (confirm('Tem certeza que deseja desvincular o relato ' + report_id + ' do grupo?')) {
        ReportsItemsService.ungroupReport(String(report_id));
      }
    };

    $scope.$on('reportGroupsUpdated', function (event, response) {
      if (!_.contains([200, 201], response.status)) {
        return $rootScope.showMessage('exclamation-sign', response.message, 'error', false);
      }

      $rootScope.showMessage('ok', response.message, 'success', false);
      _fetchGroupItems();
    });

    $scope.hasPhraseologies = function () {
      return !!_.size($scope.phraseologies);
    };

    $scope.applyPhraseology = function (phraseology) {
      $scope.newUserResponse.typing = true;
      $scope.newUserResponse.message = phraseology.description;
    };

    $scope.getVisibilityIcon = function (image) {
      return (image.visibility === 'visible') ? 'fa-unlock-alt' : 'fa-lock';
    };

    $scope.refreshImages = function () {
      $scope.loadingReportImages = true;

      var promise = ReportsImagesService.listImages($scope.report.id);
      promise.then(function (response) {
        $scope.loadingReportImages = false;
        $scope.report.images = response.data.images;
      }, function () {
        $scope.loadingReportImages = false;
        $rootScope.showMessage('exclamation-sign', 'Erro ao atualizar imagens.', 'error', false);
      });
    };

    $scope.editImage = function (image) {
      ReportsImagesEditModalService.open($scope, $scope.report, _.clone(image));
    };

    $scope.removeImage = function (image) {
      ReportsImagesDestroyModalService.open($scope, $scope.report, image);
    };

    $scope.addImages = function () {
      ReportsImagesAddModalService.open($scope, $scope.report);
    };

    $scope.showImageGallery = function (image) {
      image.versions = {};
      image.versions.original = image.original;
      GalleryModalService.open(image);
    }

    $scope.openRelatedCase = function(kase){
      $state.go('cases.edit', { id: kase.id });
    };

    $scope.openRelatedInventoryItem = function(item){
      $state.go('items.show', { id: item.id });
    };
  }
})(angular, _);

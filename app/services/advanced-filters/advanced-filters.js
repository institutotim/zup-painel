'use strict';

angular
.module('AdvancedFiltersServiceModule', [
  'AdvancedFiltersQueryModalControllerModule',
  'AdvancedFiltersCategoryModalControllerModule',
  'AdvancedFiltersStatusModalControllerModule',
  'AdvancedFiltersGroupModalControllerModule',
  'AdvancedFiltersAuthorModalControllerModule',
  'AdvancedFiltersReporterModalControllerModule',
  'PeriodSelectorModule',
  'AdvancedFiltersAreaModalControllerModule',
  'AdvancedFiltersFieldsModalControllerModule',
  'AdvancedFiltersShareModalControllerModule',
  'AdvancedFiltersNotificationMinimumNumberModalControllerModule',
  'AdvancedFiltersNotificationDeadlineModalControllerModule',
  'AdvancedFiltersNotificationOverdueModalControllerModule',
  'AdvancedFiltersNotificationSinceLastModalControllerModule',
  'ReportsCategoriesServiceModule',
  'InventoriesCategoriesServiceModule',
  'ReportsPerimetersServiceModule',
  'AdvancedFiltersShapefileModalControllerModule'
  ])

/* This file contains common filters used by inventory/reports */
.factory('AdvancedFilters', function ($modal, PeriodSelectorService, Restangular, $q, $location, $rootScope, ReportsCategoriesService, InventoriesCategoriesService, ReportsPerimetersService, $log) {
  var categoryResolver = function(type) {
    if (type === 'items') {
      return InventoriesCategoriesService.loadedBasicInfo ? _.values(InventoriesCategoriesService.categories) : InventoriesCategoriesService.fetchAllBasicInfo();
    }
    return ReportsCategoriesService.loadedBasicInfo ? _.values(ReportsCategoriesService.categories) : ReportsCategoriesService.fetchAllBasicInfo();
  };

  return {
      // advanced filter by category
      query: function (activeAdvancedFilters) {
        $modal.open({
          templateUrl: 'modals/advanced-filters/query/advanced-filters-query.template.html',
          windowClass: 'filterQueryModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersQueryModalController'
        });
      },

      // advanced filter by category
      category: function (activeAdvancedFilters, type) {
        $rootScope.resolvingRequest = true;

        $modal.open({
          templateUrl: 'modals/advanced-filters/category/advanced-filters-category.template.html',
          windowClass: 'filterCategoriesModal',
          resolve: {
            'categoriesResponse': function(){
              return categoryResolver(type);
            },

            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            },

            entityType: function() {
              return type;
            }
          },
          controller: 'AdvancedFiltersCategoryModalController'
        });
      },

      // advanced filter by status
      status: function(activeAdvancedFilters, type) {
        $rootScope.resolvingRequest = true;

        $modal.open({
          templateUrl: 'modals/advanced-filters/status/advanced-filters-status.template.html',
          windowClass: 'filterStatusesModal',
          resolve: {
            'categoriesResponse': function() {
              return categoryResolver(type);
            },

            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            },

            entityType: function() {
              return type;
            }
          },
          controller: 'AdvancedFiltersStatusModalController'
        });
      },

      // advances filter by group
      group: function (activeAdvancedFilters, type) {
        $rootScope.resolvingRequest = true;

        $modal.open({
          templateUrl: 'modals/advanced-filters/group/advanced-filters-group.template.html',
          windowClass: 'filterGroupsModal',
          resolve: {
            'groupsResponse': function () {
              var promise = Restangular.all('groups').getList({ 'return_fields': 'id,name' });
              promise.then(function () {
                $rootScope.resolvingRequest = false;
              });

              return promise;
            },

            activeAdvancedFilters: function () {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersGroupModalController'
        });
      },

      // advanced filter by shapefile
      shapefile: function(activeAdvancedFilters) {
        $rootScope.resolvingRequest = true;

        $modal.open({
          templateUrl: 'modals/advanced-filters/shapefile/advanced-filters-shapefile.template.html',
          windowClass: 'filterCategoriesModal',
          resolve: {
            'perimetersResponse': function() {
              return ReportsPerimetersService.fetchAll({paginate: false});
            },

            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersShapefileModalController'
        });
      },

      // advanced filter by the author of the item
      author: function(activeAdvancedFilters) {
        $modal.open({
          templateUrl: 'modals/advanced-filters/author/advanced-filters-author.template.html',
          windowClass: 'filterAuthorModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersAuthorModalController'
        });
      },

      // advanced filter by the report's original author
      reporter: function(activeAdvancedFilters) {
        $modal.open({
          templateUrl: 'modals/advanced-filters/reporter/advanced-filters-reporter.template.html',
          windowClass: 'filterAuthorModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersReporterModalController'
        });
      },

      // advanced filter by date
      period: function(activeAdvancedFilters) {
        PeriodSelectorService.open(true).then(function(period){
          if(period.beginDate) {
            var beginDateFilter = {
              title: 'A partir da data',
              type: 'beginDate',
              desc: moment(period.beginDate).format('DD/MM/YYYY'),
              value: moment(period.beginDate).startOf('day').format()
            };

            activeAdvancedFilters.push(beginDateFilter);
          }

          if(period.endDate) {
            var endDateFilter = {
              title: 'Até a data',
              type: 'endDate',
              desc: moment(period.endDate).format('DD/MM/YYYY'),
              value: moment(period.endDate).endOf('day').format()
            };

            activeAdvancedFilters.push(endDateFilter);
          }
        });
      },

      // advanced filter by geographic area
      area: function(activeAdvancedFilters) {
        return $modal.open({
          templateUrl: 'modals/advanced-filters/area/advanced-filters-area.template.html',
          windowClass: 'filterAreaModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersAreaModalController'
        });
      },

      // advanced filter by minimum notification number
      notificationMinimumNumber: function(activeAdvancedFilters) {
        return $modal.open({
          templateUrl: 'modals/advanced-filters/notification/minimum-number/advanced-filters-notification-minimum-number.template.html',
          windowClass: 'filterNotificationMininumNumberModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersNotificationMinimumNumberModalController'
        });
      },

      // advanced filter by days since last notification
      notificationSinceLast: function(activeAdvancedFilters) {
        return $modal.open({
          templateUrl: 'modals/advanced-filters/notification/since-last/advanced-filters-notification-since-last.template.html',
          windowClass: 'filterNotificationModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersNotificationSinceLastModalController'
        });
      },

      // advanced filter by days for last notification deadline
      notificationDeadline: function(activeAdvancedFilters) {
        return $modal.open({
          templateUrl: 'modals/advanced-filters/notification/deadline/advanced-filters-notification-deadline.template.html',
          windowClass: 'filterNotificationModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersNotificationDeadlineModalController'
        });
      },

      // advanced filter by days for overdue notification
      notificationOverdue: function(activeAdvancedFilters) {
        return $modal.open({
          templateUrl: 'modals/advanced-filters/notification/overdue/advanced-filters-notification-overdue.template.html',
          windowClass: 'filterNotificationModal',
          resolve: {
            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersNotificationOverdueModalController'
        });
      },

      fields: function(activeAdvancedFilters) {
        $rootScope.resolvingRequest = true;

        $modal.open({
          templateUrl: 'modals/advanced-filters/fields/advanced-filters-fields.template.html',
          windowClass: 'fieldsCategoriesModal',
          resolve: {
            'categoriesResponse': ['Restangular', function(Restangular) {
              return categoryResolver('items');
            }],

            activeAdvancedFilters: function() {
              return activeAdvancedFilters;
            }
          },
          controller: 'AdvancedFiltersFieldsModalController'
        });
      },

      share: function() {
        $modal.open({
          templateUrl: 'modals/advanced-filters/share/advanced-filters-share.template.html',
          windowClass: 'shareModal',
          resolve: {
            url: function() {
              var deferred = $q.defer();

              var request = gapi.client.urlshortener.url.insert({
                'resource': {'longUrl': $location.absUrl()}
              });

              request.execute(function(response) {
                deferred.resolve(response.id);
              });

              return deferred.promise;
            }
          },
          controller: 'AdvancedFiltersShareModalController'
        });
      }
    };
  });

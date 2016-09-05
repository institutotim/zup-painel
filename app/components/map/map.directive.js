'use strict';

angular
  .module('MapComponentModule', [
    'GoogleMapServiceModule',
    'ReportsItemsServiceModule',
    'InventoriesItemsServiceModule'
  ])

  .directive('map', function ($rootScope, GoogleMapService, ReportsItemsService, InventoriesItemsService, ENV) {
    return {
      restrict: 'A',
      scope: {
        getCategory: '&',
        getData: '&',
        getFiltersOptions: '&',
        filterSelectedAreas: '='
      },
      link: function postLink(scope, element, attrs) {
        var itemsAreReports = attrs.mapCategory === 'reports' ? true : false;

        // we create a new map instance
        var map = new GoogleMapService(itemsAreReports, parseFloat(ENV.mapLat), parseFloat(ENV.mapLng), parseInt(ENV.mapZoom, 10), element[0]);

        // TODO replace the `else` part of this ternary operation with InventoryItemsService
        var dataFetcher = itemsAreReports ? ReportsItemsService.fetchClustered : InventoriesItemsService.fetchClustered;

        var lastRequestReference = null;

        var movedMap = function() {
          var mapCenter = map.getCenter();

          var options = {
            zoom: map.getZoom(),
            clusterize: true
          }, filtersOptions = scope.getFiltersOptions() || {};

          var position = {'latitude': mapCenter.lat(), 'longitude': mapCenter.lng(), 'distance': map.getDistance()};

          $rootScope.mapDebug = _.extend({zoom: options['zoom']}, position);

          if (_.isUndefined(filtersOptions['position[0][latitude]']))
          {
            options['position[latitude]'] = position.latitude;
            options['position[longitude]'] = position.longitude;
            options['position[distance]'] = position.distance;
          }

          options = _.extend(options, filtersOptions);

          lastRequestReference = options;

          itemsAreReports ? ReportsItemsService.resetCache() : InventoriesItemsService.resetCache();
          dataFetcher(options).then(function(response) {
            // Using the `options` object reference of the latest request as guide as to whether or not to updated the
            // map based on it because by the time this function is called the user may have zoomed in or out already,
            // and so may cause flicker if the next request arises too close to this one
            if (lastRequestReference === options)
            {
              var nextClusters = response.clusters;
              var nextItems = itemsAreReports ? response.reports : response.items;

              map.processMarkers(nextClusters, nextItems);
              if (map.hasOwnProperty('processMarkersCanvas')) {
                map.processMarkersCanvas(nextClusters, nextItems);
              }
            }
          });
        };

        var fetchItemsTimeout = null, clearCanvasTimeout = null;

        var boundsChanged = function () {
          if (fetchItemsTimeout)
          {
            clearTimeout(fetchItemsTimeout);
          }

          fetchItemsTimeout = setTimeout(function () {
            movedMap();
          }, 300);

          // we clear the hidden faster than fetching new items
          if (clearCanvasTimeout)
          {
            clearTimeout(clearCanvasTimeout);
          }

          clearCanvasTimeout = setTimeout(function () {
            map.hideOutOfBoundsMarkers();
          }, 100);
        };

        // we bind a few events to the map
        var currentZoom = map.getZoom();

        google.maps.event.addListener(map.getMap(), 'bounds_changed', function () {
          if (currentZoom !== map.getZoom())
          {
            map.changeFilterOuterCircles();

            currentZoom = map.getZoom();
          }

          boundsChanged();
        });

        var listenerDragEnd = google.maps.event.addListener(map.getMap(), 'dragend', function() {
          if (map.overlay && map.overlay.hasOwnProperty('draw')) {
            map.overlay.draw();
          }
        });

        scope.$on('mapRefreshRequested', function () {
          boundsChanged();

          scope.$watch('filterSelectedAreas', function() {
            map.processAreaFilters(scope.filterSelectedAreas);
          });
        });

        var $handleDestroy = scope.$on('$destroy', function() {
          if (listenerDragEnd) {
            google.maps.event.removeListener(listenerDragEnd);
            listenerDragEnd = null;
          }

          $handleDestroy();
          $handleDestroy = null;
        });
      }
  }
});

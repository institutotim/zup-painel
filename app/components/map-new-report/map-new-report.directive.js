'use strict';

angular
  .module('MapNewReportComponentModule', [])

  .directive('mapNewReport', function ($compile, $timeout, Restangular, FullResponseRestangular, ENV, $filter) {
    var geocoder = new google.maps.Geocoder();

    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var zoom = parseInt(ENV.mapZoom);
        if(scope.address.address != '') {
          zoom = 16;
        }
        var mapProvider = {
          options:
          {
            homeLatlng: new google.maps.LatLng(ENV.mapLat, ENV.mapLng),
            map: {
              zoom: zoom,
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: ['Google Map', 'Open Street Map']
              },
              panControl: true,
              panControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
              },
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
              },
              scaleControl: true,
              scaleControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
              },
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
              }
            }
          },
          osmMapTypeOptions: {
            getTileUrl: function(coord, zoom) {
              return "http://tile.openstreetmap.org/" +
              zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            maxZoom: 19,
            minZoom: 0,
            name: 'Open Street Map'
          },

          zoomLevels: {},
          currentZoom: parseInt(ENV.mapZoom),
          map: null,
          getNewItemsTimeout: null,
          hideNotVisibleMarkersTimeout: null,
          doAnimation: true,
          activeMethod: 'reports', // or items
          activeInventoryFilters: [],
          hiddenReportsCategories: [],
          hiddenInventoryCategories: [],
          mainMarker: null,
          allows_arbitrary_position: true,
          bindsToInventoryCategories: false,

          start: function() {
            // create map and set specific listeners
            this.createMap();
            this.setListeners();
          },

          createMap: function() {
            this.zoomLevels = {};
            this.currentZoom = 11;

            var styledMap = new google.maps.StyledMapType(this.options.styles, { name: 'Google Map' });
            var osmMapType = new google.maps.ImageMapType(this.osmMapTypeOptions);

            this.map = new google.maps.Map(element[0], this.options.map);

            this.map.mapTypes.set('Google Map', styledMap);
            this.map.mapTypes.set('Open Street Map', osmMapType);
            this.map.setMapTypeId('Google Map');
            this.map.setCenter(this.options.homeLatlng);

            setTimeout(function() {
              google.maps.event.trigger(mapProvider.map, 'resize');
              google.maps.event.trigger(mapProvider.map, 'bounds_changed');
              mapProvider.map.setCenter(mapProvider.options.homeLatlng);
              if(!scope.lat && !scope.lng)
                mapProvider.checkMarkerInsideAllowedBounds(mapProvider.options.homeLatlng.lat(), mapProvider.options.homeLatlng.lng());
            }, 80);
          },

          setListeners: function() {
            // if the address or number changes we update the map
            scope.$on('addressChanged', function(e, has_updated_position){
              if(has_updated_position) {
                var location = new google.maps.LatLng(scope.lat, scope.lng);
                mapProvider.mainMarker.setPosition(location);
                mapProvider.map.setCenter(location);
              } else {
                var address = scope.address.address + ', ' + scope.address.number;
                if(scope.address.district) {
                  address += ', ' + scope.address.district;
                }
                if(scope.address.city) {
                  address += ', ' + scope.address.city;
                }
                geocoder.geocode({ address: address, region: 'BR' }, function(results, status){
                  if (status === google.maps.GeocoderStatus.OK) {
                    if(results.length > 0) {
                      mapProvider.mainMarker.setPosition(results[0].geometry.location);
                      mapProvider.map.setCenter(results[0].geometry.location);
                      scope.lat = scope.$parent.lat = mapProvider.mainMarker.getPosition().lat();
                      scope.lng = scope.$parent.lng = mapProvider.mainMarker.getPosition().lng();
                      mapProvider.checkMarkerInsideAllowedBounds(scope.$parent.lat, scope.$parent.lng);
                    }
                  }
                });
              }
            });

            // refresh map when shown
            scope.$watch('categoryData', function () {
              if(!scope.categoryData) return;
              this.bindsToInventoryCategories = typeof scope.categoryData.inventory_categories !== 'undefined';
              mapProvider.createMap();

              setTimeout(function() {
                var latLng;
                if(scope.lat && scope.lng) {
                  latLng = new google.maps.LatLng(scope.lat, scope.lng);
                } else {
                  latLng = mapProvider.options.homeLatlng;
                }

                google.maps.event.trigger(mapProvider.map, 'resize');
                google.maps.event.trigger(mapProvider.map, 'bounds_changed');
                mapProvider.map.setCenter(latLng);
                scope.$emit('reportMap:position_changed', latLng);

                if (scope.categoryData)
                {
                  if (!this.bindsToInventoryCategories)
                  {
                    var categoryIcon = new google.maps.MarkerImage(scope.categoryData.marker.retina.web, null, null, null, new google.maps.Size(54, 51));

                    var marker = new google.maps.Marker(
                      {
                        map: mapProvider.map,
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                        position: latLng,
                        icon: categoryIcon
                      });

                    mapProvider.mainMarker = marker;

                    mapProvider.allows_arbitrary_position = true;

                    scope.$apply();

                    google.maps.event.addListener(marker, 'dragend', function() {
                      scope.markerPositionUpdated = true;
                      scope.lat = scope.$parent.lat = mapProvider.mainMarker.getPosition().lat();
                      scope.lng = scope.$parent.lng = mapProvider.mainMarker.getPosition().lng();
                      mapProvider.checkMarkerInsideAllowedBounds(scope.$parent.lat, scope.$parent.lng);
                      scope.$emit('reportMap:position_changed', new google.maps.LatLng(scope.lat, scope.lng));
                      scope.$apply();
                      scope.$parent.$apply();
                    });
                  }
                  else
                  {
                    // Set listener for when bounds changes
                    google.maps.event.addListener(mapProvider.map, 'bounds_changed', function() {
                      mapProvider.boundsChanged();
                    });

                    google.maps.event.trigger(mapProvider.map, 'bounds_changed');

                    mapProvider.allows_arbitrary_position = false;
                    mapProvider.mainMarker = null;

                    scope.$apply();
                  }
                }

                // clear addresses
                scope.itemId = null;
                scope.formattedAddress = null;

                scope.$apply();
              }, 80);
            });

            scope.updateMarkerAddress = function() {
              mapProvider.changedMarkerPosition(mapProvider.mainMarker.getPosition().lat(), mapProvider.mainMarker.getPosition().lng());

              scope.markerPositionUpdated = false;
            };
          },

          changedMarkerPosition: function(lat, lng, itemId, keepAddress) {
            if (typeof itemId === 'undefined')
            {
              scope.lat = lat;
              scope.lng = lng;
            }
            else
            {
              scope.itemId = itemId;
            }

            if (_.isUndefined(keepAddress) || !keepAddress)
            {
              geocoder.geocode({
                  latLng: new google.maps.LatLng(lat, lng)
                },
                function(results, status)
                {
                  if (status === google.maps.GeocoderStatus.OK)
                  {
                    var addressComponents = $filter('filterGoogleAddressComponents')(results[0].address_components);

                    if(addressComponents.number && addressComponents.number.indexOf('-') !== -1) {
                      addressComponents.number = addressComponents.number.split('-')[0];
                    }

                    scope.address.address = addressComponents.address;
                    scope.address.number = parseInt(addressComponents.number, 10);
                    scope.address.district = addressComponents.neighborhood;
                    scope.address.city = addressComponents.city;
                    scope.address.state = addressComponents.state;
                    scope.address.country = addressComponents.country;
                    scope.address.postal_code = addressComponents.zipcode;

                    scope.$apply();
                  }
                });
            }
          },

          checkMarkerInsideAllowedBounds: function(lat, lng) {
            // we verify if the marker is inside bounds
            var verifyMarkerInsideBoundsPromise = FullResponseRestangular.all('utils').all('city-boundary').customGET('validate', { longitude: lng, latitude: lat });

            verifyMarkerInsideBoundsPromise.then(function(response) {
              if (response.data.inside_boundaries === false) scope.markerOutOfBounds = true;
              else scope.markerOutOfBounds = false;
            });
          },

          boundsChanged: function(forceReset) {
            var clearLevels = false;

            if (typeof this.zoomLevels[this.map.getZoom()] === 'undefined')
            {
              this.zoomLevels[this.map.getZoom()] = {};
            }

            // Check if zoom has changed
            if (this.currentZoom !== this.map.getZoom())
            {
              clearLevels = true;

              this.currentZoom = this.map.getZoom();
            }

            // Wait a bit until hide/show items
            if (this.hideNotVisibleMarkersTimeout)
            {
              $timeout.cancel(this.hideNotVisibleMarkersTimeout);
            }

            this.hideNotVisibleMarkersTimeout = $timeout(function() {
              mapProvider.hideNotVisibleMarkers();
            }, 200);

            // Wait a bit until get new items
            if(this.bindsToInventoryCategories) {
              if (this.getNewItemsTimeout)
              {
                $timeout.cancel(this.getNewItemsTimeout);
              }

              scope.isLoadingItems = true;

              this.getNewItemsTimeout = $timeout(function() {
                var categoryIds = [];

                for (var i = scope.categoryData.inventory_categories.length - 1; i >= 0; i--) {
                  categoryIds.push(scope.categoryData.inventory_categories[i].id);
                };

                var itemsPromise = Restangular.all('inventory').all('items').getList({
                  'position[latitude]': mapProvider.map.getCenter().lat(),
                  'position[longitude]': mapProvider.map.getCenter().lng(),
                  'position[distance]': mapProvider.getDistance(),
                  'zoom': mapProvider.map.getZoom(),
                  'limit': 100,
                  'inventory_category_id': categoryIds.join()
                });

                itemsPromise.then(function(response) {
                  scope.isLoadingItems = false;

                  if (forceReset === true)
                  {
                    mapProvider.removeAllMarkers();
                  }

                  if (clearLevels)
                  {
                    mapProvider.hideAllMarkersFromInactiveLevels();
                  }

                  // add item
                  for (var i = response.data.length - 1; i >= 0; i--) {
                    mapProvider.addMarker(response.data[i], mapProvider.doAnimation);
                  }

                  // after first request we will deactive animation
                  if (mapProvider.doAnimation === true)
                  {
                    mapProvider.doAnimation = false;
                  }
                });

              }, 1000);
            }},

          // Hide every marker that is not visible to the user
          hideNotVisibleMarkers: function() {
            angular.forEach(this.zoomLevels[this.map.getZoom()], function(marker, id) {
              if (!mapProvider.isMarkerInsideBounds(marker))
              {
                marker.setVisible(false);
              }
              else
              {
                var cat, pos;

                if (marker.type === 'report')
                {
                  pos = mapProvider.hiddenReportsCategories.indexOf(marker.item.category_id);
                }

                if (marker.type === 'item')
                {
                  pos = mapProvider.hiddenInventoryCategories.indexOf(marker.item.inventory_category_id);
                }

                if (!~pos)
                {
                  marker.setVisible(true);
                }
              }
            });
          },

          hideAllMarkersFromInactiveLevels: function() {
            angular.forEach(this.zoomLevels, function(zoomLevel, zoomLevelId) {
              console.log(zoomLevelId, mapProvider.currentZoom);
              if (zoomLevelId != mapProvider.currentZoom)
              {
                angular.forEach(zoomLevel, function(marker, id) {
                  marker.setVisible(false);
                });
              }
            });
          },

          isMarkerInsideBounds: function(marker) {
            return this.map.getBounds().contains(marker.getPosition());
          },

          addMarker: function(item, effect, type) {
            if (typeof this.zoomLevels[this.map.getZoom()][type + '_' + item.id] === 'undefined')
            {
              var LatLng = new google.maps.LatLng(item.position.latitude, item.position.longitude);

              var infowindow = new google.maps.InfoWindow();

              var category = scope.getInventoryCategory(item.inventory_category_id);
              var iconSize = new google.maps.Size(15, 15);
              var viewAction = scope.viewItem;
              var itemType = 'item';

              var pos = mapProvider.hiddenInventoryCategories.indexOf(item.inventory_category_id);

              var categoryIcon = new google.maps.MarkerImage(category.pin.retina.web, null, null, null, iconSize);

              var pinOptions = {
                position: LatLng,
                map: this.map,
                icon: categoryIcon,
                category: category,
                item: item,
                type: itemType
              };

              if (typeof effect !== 'undefined' && effect === true)
              {
                pinOptions.animation = google.maps.Animation.DROP;
              }

              var pin = new google.maps.Marker(pinOptions);

              this.zoomLevels[this.map.getZoom()][type + '_' + item.id] = pin;

              google.maps.event.addListener(pin, 'click', function() {
                var position = new google.maps.LatLng(this.item.position.latitude, this.item.position.longitude);

                mapProvider.changedMarkerPosition(this.item.position.latitude, this.item.position.longitude, this.item.id);

                if (mapProvider.mainMarker === null)
                {
                  var categoryIcon = new google.maps.MarkerImage(scope.categoryData.marker.retina.web, null, null, null, new google.maps.Size(54, 51));

                  var marker = new google.maps.Marker(
                    {
                      map: mapProvider.map,
                      animation: google.maps.Animation.DROP,
                      position: position,
                      icon: categoryIcon
                    });

                  mapProvider.mainMarker = marker;
                }
                else
                {
                  mapProvider.mainMarker.setPosition(position);
                }
              });
            }
          },

          getDistance: function() {
            var bounds = this.map.getBounds();

            var center = bounds.getCenter();
            var ne = bounds.getNorthEast();

            var dis = google.maps.geometry.spherical.computeDistanceBetween(center, ne);

            return dis;
          }
        };

        mapProvider.start();

        // bind to scope
        scope.mapProvider = mapProvider;
      }
    };
  });

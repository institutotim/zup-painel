'use strict';

angular
  .module('SelectLatLngMapComponent', [])
  .directive('selectLatLngMap', function ($rootScope, ENV, FullResponseRestangular) {
    return {
      restrict: 'A',
      scope: {},
      link: function postLink(scope, element) {
        var mapProvider = {
          options:
          {
            homeLatlng: new google.maps.LatLng(ENV.mapLat, ENV.mapLng),
            map: {
              zoom: parseInt(ENV.mapZoom),
              scrollwheel: true,
              panControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
              },
              zoomControlOptions: {
                style: google.maps.ZoomControlStyle.MEDIUM,
                position: google.maps.ControlPosition.LEFT_BOTTOM
              },
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: ['Google Map', 'Open Street Map']
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

          map: null,
          mainMarker: null,

          start: function() {
            var styledMap = new google.maps.StyledMapType(this.options.styles, { name: 'Google Map' });
            var osmMapType = new google.maps.ImageMapType(this.osmMapTypeOptions);

            this.map = new google.maps.Map(element[0], this.options.map);

            this.map.mapTypes.set('Google Map', styledMap);
            this.map.mapTypes.set('Open Street Map', osmMapType);
            this.map.setMapTypeId('Google Map');

            var position;

            if (scope.$parent.latLng[0] === null && scope.$parent.latLng[1] === null)
            {
              position = mapProvider.options.homeLatlng;
            }
            else
            {
              position = new google.maps.LatLng(scope.$parent.latLng[0], scope.$parent.latLng[1]);
              mapProvider.changedMarkerPosition(scope.$parent.latLng[0], scope.$parent.latLng[1]);
            }

            var categoryIcon = new google.maps.MarkerImage(scope.$parent.category.marker.retina.web, null, null, null, new google.maps.Size(54, 51));

            var marker = new google.maps.Marker(
            {
              map: mapProvider.map,
              draggable: true,
              animation: google.maps.Animation.DROP,
              position: position,
              icon: categoryIcon
            });

            mapProvider.mainMarker = marker;

            mapProvider.map.setCenter(position);
            mapProvider.checkMarkerInsideAllowedBounds(mapProvider.mainMarker.getPosition().lat(), mapProvider.mainMarker.getPosition().lng());

            google.maps.event.addListener(marker, 'dragend', function() {
              scope.$parent.latLng[0] = mapProvider.mainMarker.getPosition().lat();
              scope.$parent.latLng[1] = mapProvider.mainMarker.getPosition().lng();

              mapProvider.changedMarkerPosition(mapProvider.mainMarker.getPosition().lat(), mapProvider.mainMarker.getPosition().lng());
              mapProvider.checkMarkerInsideAllowedBounds(mapProvider.mainMarker.getPosition().lat(), mapProvider.mainMarker.getPosition().lng());
            });
          },

          checkMarkerInsideAllowedBounds: function(lat, lng) {
            // we verify if the marker is inside bounds
            var verifyMarkerInsideBoundsPromise = FullResponseRestangular.all('utils').all('city-boundary').customGET('validate', { longitude: lng, latitude: lat });

            verifyMarkerInsideBoundsPromise.then(function(response) {
              scope.$parent.markerOutOfBounds = response.data.inside_boundaries === false;
            });
          },

          changedMarkerPosition: function(lat, lng, addressComponents, formattedAddress) {
            var geocoder = new google.maps.Geocoder();

            scope.$parent.latLng = [lat, lng];

            scope.$parent.addressComponents = null;
            scope.$parent.formattedAddress = null;

            if (typeof addressComponents !== 'undefined')
            {
              scope.$parent.addressComponents = addressComponents;
            }

            if (typeof formattedAddress !== 'undefined')
            {
              scope.$parent.formattedAddress = formattedAddress;
            }

            geocoder.geocode({
              latLng: new google.maps.LatLng(lat, lng)
            },
            function(results, status)
            {
              if (status === google.maps.GeocoderStatus.OK)
              {
                if (typeof addressComponents === 'undefined')
                {
                  if (scope.$parent)
                  {
                    scope.$parent.addressComponents = results[0].address_components;
                    scope.$parent.formattedAddress = results[0].formatted_address;
                  }

                  scope.formattedAddress = results[0].formatted_address;
                }

                scope.$apply();
              }
            });
          },
        };

        mapProvider.start();

        $rootScope.selectLatLngMap = mapProvider;
      }
    };
  });

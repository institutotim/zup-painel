/* global google */
'use strict';

angular
  .module('ReportSearchMapComponentModule', [
    'FilterGoogleAddressComponentsHelperModule'
  ])

  .directive('reportSearchMap', function ($timeout, $filter, $rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        scope.$watch('mapProvider', function() {
          if (typeof scope.mapProvider !== 'undefined')
          {
            google.maps.event.clearListeners(scope.mapProvider.map);

            var options = {
              types: ['address'],
              componentRestrictions: { country: 'br' }
            };

            var autocomplete = new google.maps.places.Autocomplete(element[0], options);
            autocomplete.bindTo('bounds', scope.mapProvider.map);

            var callback = function(predictions, status) {
              if (status != google.maps.places.PlacesServiceStatus.OK) {
                $timeout(function() {
                  scope.showLoadingForAutocompleteRequest = false;
                });
              }
            };

            var service = new google.maps.places.AutocompleteService();
            var doQueryServiceTimeout;
            scope.showLoading = function() {
              scope.showLoadingForAutocompleteRequest = true;
              if(!doQueryServiceTimeout) {
                doQueryServiceTimeout = $timeout(function(){
                  service.getQueryPredictions({ input: element[0] }, callback);
                  doQueryServiceTimeout = undefined;
                }, 400);
              }
            };

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
              var place = autocomplete.getPlace();

              if (!place.geometry) {
                return;
              }

              $rootScope.$broadcast('reports:position-updated', place.geometry.location);

              var addressComponents = $filter('filterGoogleAddressComponents')(place.address_components);

              scope.$apply(function() {
                scope.address.address = addressComponents.address;
                scope.address.number = parseInt(addressComponents.number, 10);
                scope.address.reference = '';
                scope.address.district = addressComponents.neighborhood;
                if(addressComponents.city)
                  scope.address.city = addressComponents.city;
                if(addressComponents.state)
                  scope.address.state = addressComponents.state;
                if(addressComponents.country)
                  scope.address.country = addressComponents.country;
              });

              /* start hack to get zipcode */
              var geocoder = new google.maps.Geocoder();

              geocoder.geocode({
                latLng: place.geometry.location
              },
              function(results, status)
              {
                if (status === google.maps.GeocoderStatus.OK)
                {
                  var addressComponents = $filter('filterGoogleAddressComponents')(results[0].address_components);

                  scope.$apply(function() {
                    scope.address.postal_code = addressComponents.zipcode;
                  });
                }
              });
              /* end hack to get zipcode */

              if (place.geometry.viewport) {
                scope.mapProvider.map.fitBounds(place.geometry.viewport);
              } else {
                scope.mapProvider.map.setCenter(place.geometry.location);
                scope.mapProvider.map.setZoom(17);
              }

              if (scope.mapProvider.allows_arbitrary_position == true)
              {
                scope.mapProvider.mainMarker.setPosition(place.geometry.location);
                scope.mapProvider.changedMarkerPosition(place.geometry.location.lat(), place.geometry.location.lng(), undefined, true);
                scope.mapProvider.checkMarkerInsideAllowedBounds(scope.mapProvider.mainMarker.getPosition().lat(), scope.mapProvider.mainMarker.getPosition().lng());
              }
              else
              {
                var marker = new google.maps.Marker({
                  map: scope.mapProvider.map,
                  position: place.geometry.location
                });

                marker.setIcon(({
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(35, 35),
                }));
              }
            });
          }
        });
      }
    };
  });

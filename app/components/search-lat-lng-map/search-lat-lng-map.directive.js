'use strict';

angular
  .module('SearchLatLngMapComponent', [])

  .directive('searchLatLngMap', function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        $rootScope.$watch('selectLatLngMap', function() {
          if (typeof $rootScope.selectLatLngMap !== 'undefined')
          {
            google.maps.event.clearListeners($rootScope.selectLatLngMap.map);

            var options = {
              types: ['geocode'],
              componentRestrictions: { country: 'br' }
            };

            var autocomplete = new google.maps.places.Autocomplete(element[0], options);
            autocomplete.bindTo('bounds', $rootScope.selectLatLngMap.map);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
              var place = autocomplete.getPlace();

              if (!place.geometry) {
                return;
              }

              if (place.geometry.viewport) {
                $rootScope.selectLatLngMap.map.fitBounds(place.geometry.viewport);
              } else {
                $rootScope.selectLatLngMap.map.setCenter(place.geometry.location);
                $rootScope.selectLatLngMap.map.setZoom(17);
              }

              $rootScope.selectLatLngMap.mainMarker.setPosition(place.geometry.location);
              $rootScope.selectLatLngMap.changedMarkerPosition(place.geometry.location.lat(), place.geometry.location.lng(), place.address_components, place.formatted_address);
            });
          }
        });
      }
    };
  });

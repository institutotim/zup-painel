'use strict';

angular
  .module('AddAreaCircleFormComponentModule', [])
  .directive('addAreaCircleForm', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var options = {
          types: ['geocode'],
          componentRestrictions: { country: 'br' }
        };

        var autocomplete = new google.maps.places.Autocomplete(element.find('.address')[0], options);
        autocomplete.bindTo('bounds', scope.map);

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();

          if (!place.geometry) {
            return;
          }

          element.find('.lat').val(place.geometry.location.lat());
          element.find('.lng').val(place.geometry.location.lng());
        });

        scope.addCircle = function() {
          var latInput = element.find('.lat'), lngInput = element.find('.lng'), hasError = false;

          latInput.removeClass('form-error');
          lngInput.removeClass('form-error');

          if (latInput.val() === '')
          {
            latInput.addClass('form-error');

            hasError = true;
          }

          if (lngInput.val() === '')
          {
            lngInput.addClass('form-error');

            hasError = true;
          }

          if (!hasError)
          {
            scope.addCircleByLatLng(latInput.val(), lngInput.val());
          }
        };
      }
    };
  });

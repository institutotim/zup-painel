(function (angular, google) {
  'use strict';

  angular
    .module('MapStreetViewComponentModule', [])
    .directive('mapStreetview', StreetViewComponent);

  StreetViewComponent.$inject = [];
  function StreetViewComponent() {
    return {
      restrict: 'E',
      scope: {
        latitude: '=',
        longitude: '=',
        flag: '=',
        iconFormat: '=',
        iconMarker: '=',
        iconPin: '='
      },
      link: StreetViewLink
    }
  }

  function StreetViewLink(scope, element) {
    var panorama = new google.maps.StreetViewPanorama(element[0]);
    var latLng = new google.maps.LatLng(scope.latitude, scope.longitude);
    var service = new google.maps.StreetViewService();

    service.getPanoramaByLocation(latLng, 50, computePano);

    function computePano(panoData, status) {
      if (status != google.maps.StreetViewStatus.OK)  {
        scope.hide = true;
      }

      var angle = computeAngle(latLng, panoData.location.latLng);
      var panoOptions = {
        position: latLng,
        addressControl: true,
        linksControl: true,
        panControl: false,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        pov: {
          heading: angle,
          pitch: 10,
          zoom: 1
        },
        enableCloseButton: false,
        visible:true
      };

      panorama.setOptions(panoOptions);
    };

    function computeAngle(endLatLng, startLatLng) {
      var DEGREE_PER_RADIAN = 57.2957795;
      var RADIAN_PER_DEGREE = 0.017453;

      var dlat = endLatLng.lat() - startLatLng.lat();
      var dlng = endLatLng.lng() - startLatLng.lng();

      var yaw = Math.atan2(dlng * Math.cos(endLatLng.lat() * RADIAN_PER_DEGREE), dlat) * DEGREE_PER_RADIAN;

      return wrapAngle(yaw);
    }

    function wrapAngle(angle) {
      if (angle >= 360) {
        angle -= 360;
      }
      else if (angle < 0) {
        angle += 360;
      }

      return angle;
    };

    function addMarker(icon) {
      var LatLng = new google.maps.LatLng(icon.lat, icon.lng);
      var iconSize, iconImg;

      if (icon.format === "marker") {
        iconSize = new google.maps.Size(54, 51);
        iconImg = icon.marker;
      } else {
        iconSize = new google.maps.Size(15, 15);
        iconImg = icon.pin;
      }

      var markerIcon = new google.maps.MarkerImage(iconImg, null, null, null, iconSize);

      var pinOptions = {
        position: LatLng,
        map: panorama,
        icon: markerIcon
      };

      return new google.maps.Marker(pinOptions);
    };

    addMarker({
      format: scope.iconFormat,
      marker: scope.iconMarker,
      pin: scope.iconPin,
      lat: scope.lat,
      lng: scope.lng
    });
  }
})(angular, google);

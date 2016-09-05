'use strict';

angular
  .module('MapViewStreetviewComponentModule', [])

  .directive('mapViewStreetview', function () {
    return {
      restrict: 'A',
      scope: {
        latitude: '=',
        longitude: '='
      },
      link: function(scope, element, attrs) {
        var panorama = new google.maps.StreetViewPanorama(element.find('.roundedMap').get(0));

        var addLatLng = new google.maps.LatLng(scope.latitude, scope.longitude);

        var service = new google.maps.StreetViewService();

        service.getPanoramaByLocation(addLatLng, 50, computePano);

        function computePano(panoData, status) {
          if (status != google.maps.StreetViewStatus.OK)
          {
            scope.$parent.hideStreetview = true;
            scope.$apply();

            return;
          }

          var angle = computeAngle(addLatLng, panoData.location.latLng);

          var panoOptions = {
            position: addLatLng,
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
          if (angle >= 360)
          {
            angle -= 360;
          }
          else if (angle < 0)
          {
            angle += 360;
          }

          return angle;
        };

        var addMarker = function(item, category) {
          var LatLng = new google.maps.LatLng(item.position.latitude, item.position.longitude);

          var iconSize, iconImg;

          if (category.plot_format === "marker")
          {
            iconSize = new google.maps.Size(54, 51);
            iconImg = category.marker.retina.web;
          }
          else
          {
            iconSize = new google.maps.Size(15, 15);
            iconImg = category.pin.retina.web;
          }

          var categoryIcon = new google.maps.MarkerImage(iconImg, null, null, null, iconSize);

          var pinOptions = {
            position: LatLng,
            map: panorama,
            icon: categoryIcon,
            category: category,
            item: item
          };

          var pin = new google.maps.Marker(pinOptions);
        };

        addMarker(scope.$parent.item, scope.$parent.category);

      }
    };
  });

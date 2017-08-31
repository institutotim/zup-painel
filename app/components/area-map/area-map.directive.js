'use strict';

angular
  .module('AreaMapComponentModule', [])
  .directive('areaMap', function (ENV) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var mapProvider = {
          options:
          {
            homeLatlng: new google.maps.LatLng(ENV.mapLat, ENV.mapLng),
            map: {
              zoom: parseInt(ENV.mapZoom),
              mapTypeControl: false,
              panControl: true,
              panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              scaleControl: true,
              scaleControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              }
            }
          },

          map: null,
          circles: [],
          lastListenerDistance: null,
          lastListenerPosition: null,

          DistanceWidget: function(map, position) {
            this.set('map', map);
            this.set('position', position);

            var marker = new google.maps.Marker({
              draggable: true,
              title: 'Me mova!',
              icon: 'data:image/png;base64,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'
            });

            // Bind the marker map property to the DistanceWidget map property
            marker.bindTo('map', this);

            // Bind the marker position property to the DistanceWidget position
            // property
            marker.bindTo('position', this);

            // Create a new radius widget
            var radiusWidget = new mapProvider.RadiusWidget(map);

            // Bind the radiusWidget map to the DistanceWidget map
            radiusWidget.bindTo('map', this);

            // Bind the radiusWidget center to the DistanceWidget position
            radiusWidget.bindTo('center', this, 'position');

            // Bind to the radiusWidgets' distance property
            this.bindTo('distance', radiusWidget);

            // Bind to the radiusWidgets' bounds property
            this.bindTo('bounds', radiusWidget);
          },

          RadiusWidget: function(map) {
            var circle = new google.maps.Circle({
              strokeWeight: 1,
              strokeColor: '#37A6CF',
              fillColor: '#37A6CF',
            });

            // Set the distance property value to be proportional to the screen size
            var center = map.getBounds().getCenter();
            var ne = map.getBounds().getNorthEast();

            var dis = google.maps.geometry.spherical.computeDistanceBetween(center, ne) / 1000; // in km! :D

            this.set('distance', attrs.initialDistance ? (attrs.initialDistance / 1000) : (dis / 3));

            // Bind the RadiusWidget bounds property to the circle bounds property.
            this.bindTo('bounds', circle);

            // Bind the circle center to the RadiusWidget center property
            circle.bindTo('center', this);

            // Bind the circle map to the RadiusWidget map
            circle.bindTo('map', this);

            // Bind the circle radius property to the RadiusWidget radius property
            circle.bindTo('radius', this);

            // Add the sizer marker
            this.addSizer_();
          },

          setHelpers: function() {
            mapProvider.DistanceWidget.prototype = new google.maps.MVCObject();

            mapProvider.RadiusWidget.prototype = new google.maps.MVCObject();

            mapProvider.RadiusWidget.prototype.distance_changed = function() { // jshint ignore:line
              this.set('radius', this.get('distance') * 1000);
            };

            mapProvider.RadiusWidget.prototype.addSizer_ = function() {
              var sizer = new google.maps.Marker({
                draggable: true,
                title: 'Me mova!',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAG2YAABzjgAA+YsAAIR4AAB8wwAA95IAAC/yAAARoZE2jZ4AAALBSURBVHjarJbvS5NRFMc/PtMpUQoDM6jMqBylRprhJoUQlEbRu4jo16LUBkXRC3vTfxAUhRX9gMrsdRBaVhBE0i9oy1qRsCkEWmQKkQpW27cXbXPN51mb+n04cLnPPfd7zzn3nHuyJGGF1bffxIZOoA4oBgqjc5+AfuARMGSm/3b3mvg425rEbwMOAieiRKnwBDgNdFotMMwmK9r9dRLvJS5LOCX4j9RJdEg8lVgem09JVNHu9wIP07DCDOuBl1E3WxOVt/uPCC4K7AKmKQ7BQ8HGxL2zYpeh/JavAegAbMwOhoDawN6qYNyislu+AsE1gW0GliRLoeD6P7dO4gSwMPE4OUYWPXsqpxzzauALZ32DacdsVZtv64d9VZ3GqjafDfAmr/gV0UxJYjgGkC3JnZCElhj/HeFOcJhUCW6BjStvvnYYEpus8iOGiXCEOdkG1zeXUpKfRxp5lSg2ifWGoMIqoAAXej6z614vP36GKZqTw436UkoK8jK9GE5DUqEkzOS8f5BzvgEC38bY3zVJdrN+BSX5uVjpmYjDSOXc1jeTgQ8MjyeQ2WlrKGVJfm78/05nyjDbDElD6Z7s3bcxPA8mydq3OCmeZ+dgeREt1YtS6Q4ZiA+ZOPvt1zE8CZbd2V7GyXWL/57bWq/XkNSVga+RRM/XUTz3PzIRjjDPPlmxLNaHJXVnIz0HRgBHJslROX8uubakEJvn2ONgY82IEWysCSNaM3Gfp2wBp9xLpm5pvr41Xr2XXXnhAD6mUyEyRHeoybUhXr1DTa4RxAFEmNkr36OIQ1MevlCzq1OoRczKFxbaHWp29Zq+sH3N7jOIozO07DtiG+Juyp6h77C7FbEFEZwGyStENaILpdEF9Xndj0BloOOg/jQYXoN2gGpAwX/LclLPYIall54lN5BrE36PAu+iDeSAmX6/tzY+/jMApcCWpTVr3IcAAAAASUVORK5CYII='
              });

              sizer.bindTo('map', this);
              sizer.bindTo('position', this, 'sizer_position');

              var me = this;
              google.maps.event.addListener(sizer, 'drag', function() {
                // Set the circle distance (radius)
                me.setDistance();
              });
            };

            mapProvider.RadiusWidget.prototype.center_changed = function() { // jshint ignore:line
              var bounds = this.get('bounds');

              // Bounds might not always be set so check that it exists first.
              if (bounds) {
                var lng = bounds.getNorthEast().lng();

                // Put the sizer at center, right on the circle.
                var position = new google.maps.LatLng(this.get('center').lat(), lng);
                this.set('sizer_position', position);
              }
            };

            mapProvider.RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
              if (!p1 || !p2) {
                return 0;
              }

              var R = 6371; // Radius of the Earth in km
              var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
              var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
              var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              var d = R * c;
              return d;
            };

            mapProvider.RadiusWidget.prototype.setDistance = function() {
              var pos = this.get('sizer_position');
              var center = this.get('center');
              var distance = this.distanceBetweenPoints_(center, pos);

              // Set the distance property for any objects that are bound to it
              this.set('distance', distance);
            };
          },

          createMap: function() {
            var styledMap = new google.maps.StyledMapType(this.options.styles, { name: 'zup' });

            this.map = new google.maps.Map(element[0], this.options.map);

            this.map.mapTypes.set('zup', styledMap);
            this.map.setMapTypeId('zup');
            this.map.setCenter(this.options.homeLatlng);

            setTimeout(function() {
              google.maps.event.trigger(mapProvider.map, 'resize');
              google.maps.event.trigger(mapProvider.map, 'bounds_changed');
              mapProvider.map.setCenter(mapProvider.options.homeLatlng);
            }, 80);

            this.setHelpers();

            if (!attrs.singleCircle) {
              // and we create an event on click to create new circles
              google.maps.event.addListener(mapProvider.map, 'click', function (a) {
                mapProvider.addCircle(a.latLng);
              });
            }
          },

          setLastCircleInfo: function(widget) {
            scope.lastCirclePosition = widget.get('position');
            scope.lastCircleDistance = widget.get('distance');
            scope.lastCircleArea = (widget.get('distance') * widget.get('distance') * Math.PI);
          },

          addCircle: function(latLng) {
            var newCircle = new mapProvider.DistanceWidget(mapProvider.map, latLng);

            mapProvider.circles.push(newCircle);
            mapProvider.setLastCircleInfo(newCircle);

            // add listeners for user changes in the last circle
            google.maps.event.removeListener(mapProvider.lastListenerDistance);
            google.maps.event.removeListener(mapProvider.lastListenerPosition);

            mapProvider.lastListenerDistance = google.maps.event.addListener(newCircle, 'distance_changed', function() { // jshint ignore:line
              mapProvider.setLastCircleInfo(newCircle);
            });

            mapProvider.lastListenerPosition = google.maps.event.addListener(newCircle, 'position_changed', function() { // jshint ignore:line
              mapProvider.setLastCircleInfo(newCircle);
            });
          }
        };

        mapProvider.createMap();

        scope.$parent.circles = mapProvider.circles;
        scope.map = mapProvider.map;
        scope.mapProvider = mapProvider;

        // helper functions for the modal
        scope.eraseAllCircles = function() {
          for (var i = mapProvider.circles.length - 1; i >= 0; i--) {
            mapProvider.circles[i].set('map', null);
          }

          mapProvider.circles = [];
        };

        scope.eraseLastCircle = function() {
          mapProvider.circles[mapProvider.circles.length - 1].set('map', null);

          mapProvider.circles.splice(mapProvider.circles.length - 1, 1);
        };

        scope.fitCirclesBounds = function() {
          if (mapProvider.circles.length === 0)
          {
            return;
          }

          var latlngbounds = new google.maps.LatLngBounds();

          // we add each "radius" outermost northEast point and southWest point to the bounds
          for (var i = mapProvider.circles.length - 1; i >= 0; i--) {
            latlngbounds.extend(mapProvider.circles[i].get('bounds').getNorthEast());
            latlngbounds.extend(mapProvider.circles[i].get('bounds').getSouthWest());
          }

          // now we make the map fit inside all of those bounds :-)
          mapProvider.map.fitBounds(latlngbounds);
        };

        scope.addCircleByLatLng = function(lat, lng) {
          mapProvider.addCircle(new google.maps.LatLng(lat, lng));

          scope.fitCirclesBounds();
        };
      }
    };
  });

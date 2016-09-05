'use strict';

angular
  .module('MapShowItemComponentModule', [])

  .directive('mapShowItem', function ($timeout, $q, $rootScope, $compile) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var mapProvider = {
          options:
          {
            homeLatlng: new google.maps.LatLng(-23.549671, -46.6321713),
            map: {
              zoom: 15,
              scrollwheel: false,
              mapTypeControl: false,
              mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'zup']
              }
            }
          },

          map: null,

          start: function() {
            var styledMap = new google.maps.StyledMapType(this.options.styles, { name: 'zup' });

            this.map = new google.maps.Map(element[0], this.options.map);

            this.map.mapTypes.set('zup', styledMap);
            this.map.setMapTypeId('zup');

            scope.$watch('loading', function () {
              if (typeof scope.item !== 'undefined')
              {
                setTimeout(function() {
                  google.maps.event.trigger(mapProvider.map, 'resize');
                  google.maps.event.trigger(mapProvider.map, 'bounds_changed');
                  mapProvider.map.setCenter(mapProvider.options.homeLatlng);

                  mapProvider.addMarker(scope.item, scope.category);
                }, 80);
              }
            });
          },

          addMarker: function(item, category) {
            var LatLng = new google.maps.LatLng(item.position.latitude, item.position.longitude);

            var infowindow = mapProvider.infoWindow, iconSize, iconImg;

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
              map: this.map,
              icon: categoryIcon,
              category: category,
              item: item
            };

            var pin = new google.maps.Marker(pinOptions);

            this.map.setCenter(LatLng);

            google.maps.event.addListener(pin, 'click', function() {
              var html = '<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ item.created_at | date: \'dd/MM/yy HH:mm\'}}</p></div>';

              var newScope = scope.$new(true);

              newScope.category = this.category;
              newScope.item = this.item;

              var compiled = $compile(html)(newScope);

              newScope.$apply();

              infowindow.setContent(compiled[0]);
              infowindow.open(mapProvider.map, this);
            });
          },
        };

        mapProvider.start();

      }
    };
  });

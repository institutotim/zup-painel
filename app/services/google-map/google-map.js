'use strict';

angular
  .module('GoogleMapServiceModule', [])
  .factory('GoogleMapService', function (ENV, $compile, $rootScope) {

    var _options = {map:{zoom: null,mapTypeControl:!0,mapTypeControlOptions:{style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,mapTypeIds: ['Google Map','Open Street Map']},panControl:!0,panControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},zoomControl:!0,zoomControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},scaleControl:!0,scaleControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},streetViewControl:!0,streetViewControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT}}};

    var osmMapTypeOptions = {
      getTileUrl: function(coord, zoom) {
        return "http://tile.openstreetmap.org/" +
        zoom + "/" + coord.x + "/" + coord.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: true,
      maxZoom: 19,
      minZoom: 0,
      name: 'Open Street Map'
    };

    /***
    *  Creates a new Google Map canvas
    *
    *  @param itemsAreReports {bool} - True is the items that will be plotted into the map are reports
    *  @param mapLat {float} - Initial map latitute
    *  @param mapLng {float} - Initial map longitude
    *  @param mapZoom {int} - Initial map zoom
    *  @param mapElement {Element} - Element object that binds to the map
    */
    var Map = function(itemsAreReports, mapLat, mapLng, mapZoom, mapElement) {
      _options.map.zoom = osmMapTypeOptions.zoom = mapZoom;

      // we define some helpers
      var homeLatlng = new google.maps.LatLng(mapLat, mapLng);
      var styledMap = new google.maps.StyledMapType(_options.styles, { name: 'Google Map' });
      var osmMapType = new google.maps.ImageMapType(osmMapTypeOptions);

      // we set the type of items the map will handle
      this.itemsAreReports = itemsAreReports;

      // we bind the google maps to out element
      this.map = new google.maps.Map(mapElement, _options.map);

      this.map.mapTypes.set('Google Map', styledMap);
      this.map.mapTypes.set('Open Street Map', osmMapType);
      this.map.setMapTypeId('Google Map');
      this.map.setCenter(homeLatlng);

      // we also initialize a few variables that we are going to use it :-D
      this.currentMarkers = {};

      // infowindow for google maps
      this.infoWindow = new google.maps.InfoWindow();

      this.activeFilterAreas = [];
    };

    Map.prototype.getDistance = function() {
      var bounds = this.map.getBounds();

      var center = bounds.getCenter();
      var ne = bounds.getNorthEast();

      return google.maps.geometry.spherical.computeDistanceBetween(center, ne);
    };

    Map.prototype.clearMarkers = function() {
      _.each(this.currentMarkers, function(marker) {
        marker.setMap(null);
      });

      this.currentMarkers = {};
    };

    Map.prototype.createMarker = function(position, markerImage, color, count, extraData, isGeneralCluster) {
      var html, extraClass = '';

      if(!_.isNull(markerImage))
      {
        extraClass = markerImage.isPin ? 'pin' : '';

        html = '<div class="marker ' + extraClass + '" style="background-image: url(' + markerImage.url + ')">';
      }
      else
      {
        if (isGeneralCluster) extraClass = 'general-cluster';

        html = '<div class="marker ' + extraClass + '">';
      }

      if (count)
      {
        html += '<span style="background-color: ' + color + ';">' + count + '</span>';
      }

      html += '</div>';

      var marker = new RichMarker({
        position: position,
        map: this.map,
        draggable: false,
        shadow: false,
        content: html,
        extraData: extraData,
        isReport: this.itemsAreReports,
        infoWindow: this.infoWindow
      });

      if (!_.isUndefined(extraData)) google.maps.event.addListener(marker, 'click', this.displayInfoWindow);
      else if (_.isNull(markerImage)) google.maps.event.addListener(marker, 'click', this.zoomToMarker);

      return marker;
    };

    Map.prototype.zoomToMarker = function() {
      this.map.setZoom(this.map.getZoom() + 1);
      this.map.setCenter(this.position);
    };

    Map.prototype.displayInfoWindow = function() {
      var html;

      if (this.isReport)
      {
        html = '<div class="pinTooltip"><h1>{{ item.category.title }}</h1><p>Enviado em {{ item.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="#/reports/{{ item.id }}">Ver detalhes</a></div>';
      }
      else
      {
        html = '<div class="pinTooltip"><h1>{{ item.title }}</h1><p>Criado em {{ item.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="#/items/{{ item.id }}">Ver detalhes</a></div>';
      }

      var newScope = $rootScope.$new(true);

      newScope.category = this.extraData.category;
      newScope.item = this.extraData.item;

      var compiled = $compile(html)(newScope);

      newScope.$apply();

      this.infoWindow.setContent(compiled[0]);
      this.infoWindow.open(this.map, this);
    };

    Map.prototype.createClusterMarker = function(cluster) {
      var position = new google.maps.LatLng(cluster.position[0], cluster.position[1]);

      if (cluster.categories_ids) return this.createMarker(position, null, '#259ECB', cluster.count, undefined, true);

      return this.createMarker(position, null, cluster.category.color, cluster.count);
    };

    Map.prototype.createItemMarker = function(item) {
      var markerImage = {};

      if (!this.itemsAreReports && item.category.plot_format === 'pin')
      {
        markerImage.url = item.category.pin.retina.web;
        markerImage.isPin = true;
      }
      else
      {
        markerImage.url = item.category.marker.retina.web;
        markerImage.isPin = false;
      }

      var position = new google.maps.LatLng(item.position.latitude, item.position.longitude);
      var marker = this.createMarker(position, markerImage, false, false, { category: item.category, item: item });

      //google.maps.event.addListener(marker, 'click', displayInfoWindow);

      return marker;
    };

    Map.prototype.processMarkers = function(nextClusters, nextItems) {
      var nextMarkers = {}, _self = this;

      _.each(nextClusters, function(cluster) {
        if ((_.isUndefined(cluster.category) || !cluster.category) && _.isUndefined(cluster.categories_ids)) return false;

        var categoryId = _.isUndefined(cluster.category) ? cluster.categories_ids[0] : cluster.category_id;

        var clusterID = (cluster.position[0]).toString() + cluster.position[1] + cluster.count + categoryId;

        if(!_self.currentMarkers[clusterID])
        {
          nextMarkers[clusterID] = _self.createClusterMarker(cluster);
          nextMarkers[clusterID].setMap(_self.map);
          nextMarkers[clusterID].setVisible(true);
        }
        else
        {
          nextMarkers[clusterID] = _self.currentMarkers[clusterID];
          delete _self.currentMarkers[clusterID];
        }
      });

      _.each(nextItems, function(item) {
        if(!_self.currentMarkers[item.id])
        {
          nextMarkers[item.id] = _self.createItemMarker(item);
          nextMarkers[item.id].setMap(_self.map);
          nextMarkers[item.id].setVisible(true);
        }
        else
        {
          nextMarkers[item.id] = _self.currentMarkers[item.id];
          delete _self.currentMarkers[item.id];
        }
      });

      _.each(this.currentMarkers, function(marker) {
        marker.setMap(null);
      });

      this.currentMarkers = nextMarkers;
    };

    Map.prototype.isMarkerInsideBounds = function(marker) {
      return this.map.getBounds().contains(marker.getPosition());
    };

    Map.prototype.hideOutOfBoundsMarkers = function() {
      var self = this;

      _.each(this.currentMarkers, function(marker) {
        if (self.isMarkerInsideBounds(marker))
        {
          marker.setVisible(true);
        }
        else
        {
          marker.setVisible(false);
        }
      });
    };

    Map.prototype.getMap = function() {
      return this.map;
    };

    Map.prototype.getZoom = function() {
      return this.map.getZoom();
    };

    Map.prototype.getCenter = function() {
      return this.map.getCenter();
    };

    Map.prototype.createCircle = function(LatLng, radius, innerCircle) {
      var options = {
        fillColor: '#6FCCEF',
        map: this.map,
        center: LatLng,
        radius: radius,
        originalDistance: radius,
        strokeWeight: 0,
        zIndex: 1
      };

      if (innerCircle)
      {
        options.fillColor = '#37A6CF';
        options.strokeWeight = 1;
        options.strokeColor = '#37A6CF';
        options.zIndex = 1;
      }

      var circle = new google.maps.Circle(options);

      return circle;
    };

    Map.prototype.clearCircles = function() {
      for (var i = this.activeFilterAreas.length - 1; i >= 0; i--) {
        this.activeFilterAreas[i].inner.setMap(null);
        this.activeFilterAreas[i].outer.setMap(null);
      };

      this.activeFilterAreas[i] = [];
    };

    var getOuterCircleDistance = function(originalDistance, map) {
      var p = Math.pow(2, (21 - map.getZoom()))
      return originalDistance + p * 1128.497220 * 0.0027;
    };

    Map.prototype.processAreaFilters = function(areas) {
      this.clearCircles();

      for (var i = areas.length - 1; i >= 0; i--) {
        var area = areas[i];

        // we create
        var pos = new google.maps.LatLng(area.latitude, area.longitude);

        var innerCircle = this.createCircle(pos, area.distance, true);
        var outerCircle = this.createCircle(pos, getOuterCircleDistance(area.distance, this));

        this.activeFilterAreas.push({ inner: innerCircle, outer: outerCircle });
      };
    };

    Map.prototype.changeFilterOuterCircles = function() {
      for (var i = this.activeFilterAreas.length - 1; i >= 0; i--) {
        var newRadius = getOuterCircleDistance(this.activeFilterAreas[i].outer.originalDistance, this);

        console.log('original -> ', this.activeFilterAreas[i].outer.originalDistance, ' new radius -> ', newRadius, 'zoom -> ', this.getZoom());

        this.activeFilterAreas[i].outer.set('radius', newRadius);
      };
    };

    return Map;

  });

'use strict';

angular
  .module('StyleMapComponentModule', [])
  .directive('styleMap', function ($window) {
    return {
      restrict: 'A',
      priority: 0,
      link: function postLink(scope, element) {
        var changeMargin = function() {
          element.find('.mapItems').css({'margin-top': element.find('.advancedSearch').height()});
        };

        var changeHeight = function() {
          // footer = 60px
          // header = 71px
          // title = 56px
          // search = element.find('.advancedSearch').height() (because it's dynamic)
          // and 2px of borders
          var mapHeight = $($window).height() - 60 - 71 - 56 - element.find('.advancedSearch').height() - 2;

          element.find('.mapItems').height(mapHeight);
        };

        changeMargin();
        changeHeight();

        $($window).resize(function() {
          changeHeight();
        });

        scope.$watch('activeAdvancedFilters', function() {
          changeMargin();
          changeHeight();
        }, true);
      }
    };
  });

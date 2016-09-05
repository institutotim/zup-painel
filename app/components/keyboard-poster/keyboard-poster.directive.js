'use strict';

angular
  .module('KeyboardPosterComponentModule', [])

  .directive('keyboardPoster', function($parse, $timeout){
    var DELAY_TIME_BEFORE_POSTING = 700;

    return function(scope, elem, attrs) {
      var element = angular.element(elem)[0];
      var currentTimeout = null;

      element.onkeydown = function() {
        var model = $parse(attrs.keyboardPoster);
        var poster = model(scope);

        if(currentTimeout) {
          $timeout.cancel(currentTimeout);
        }

        currentTimeout = $timeout(function(){
          poster(elem.val());
        }, DELAY_TIME_BEFORE_POSTING);
      };
    };
  });

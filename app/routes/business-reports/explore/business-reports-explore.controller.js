(function ($, angular) {
  'use strict';

  angular
    .module('BusinessReportsExploreControllerModule', [
      'BusinessReportsExploreHeaderDirectiveModule',
      'cv.studio'
    ])
    .controller('BusinessReportsExploreController', BusinessReportsExploreController);

  BusinessReportsExploreController.$inject = [
    '$scope',
    '$window'
  ];
  function BusinessReportsExploreController($scope, $window) {
    $scope.compact = _.compact;

    $('.cv-views-container').masonry({
      'itemSelector': '.cv-view-container',
      'columnWidth': '.cv-views-gridsizer',
      'percentPosition': true
    });

    $window.MasonryHack = { position: 'absolute' };
  }

})($, angular);

'use strict';

/*global angular */
angular
  .module('StyleResultsTableComponentModule', [])
  .directive('styleResultsTable', function ($timeout) {
    var timeoutId = null;
    return {
      restrict: 'A',
      priority: 0,
      link: function postLink(scope, element) {
        var _changeMargin = function () {
          var customTable = element.find('.custom_table'),
              advancedSearch = element.find('.advancedSearch'),
              groupSuggestions = element.find('.groupSuggestions');

          customTable.css({ 'margin-top': (advancedSearch ? advancedSearch.height() : 0) + (groupSuggestions ? groupSuggestions.height() : 0) });
          groupSuggestions.css({ 'margin-top': (advancedSearch ? advancedSearch.height() : 0) });
        };

        _changeMargin();

        var _handleMarginChange = function () {
          if (timeoutId) {
            $timeout.cancel(timeoutId);
          }
          timeoutId = $timeout(function () {
            _changeMargin();
          }, 0);
        };

        scope.$watch('activeAdvancedFilters', _handleMarginChange, true);
        scope.$watch('suggestions', _handleMarginChange);
      }
    };
  });

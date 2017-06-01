/*global angular, $*/
'use strict';

/**
 * Use bpt-options to pass scope var name that contains options for the popover
 */
angular.module('bootstrap-popover-tooltip', [])
  .directive('bptToggle', function ($compile, $timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var options = scope[attrs.bptOptions];
        if (!options) {
          options = {
            animation: attrs.bptAnimation || true,
            container: attrs.bptContainer || false,
            content: attrs.bptContent || '',
            delay: attrs.bptDelay || 0,
            html: attrs.bptHtml || false,
            placement: attrs.bptPlacement || 'right',
            selector: attrs.bptSelector || false,
            template: attrs.bptTemplate || '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
            title: attrs.bptTitle || '',
            trigger: attrs.bptTrigger || 'click',
            viewport: attrs.bptViewport || {selector: 'body', padding: 0}
          };
        } else {
          options = {};
        }

        if (attrs.bptContentId) {
          options.content = $('#' + attrs.bptContentId).html();
        }

        if (attrs.bptCompile) {
          var compileContent = $compile(options.content);
          options.content = compileContent(scope);

          $timeout(function () {
            options.content = options.content.html();
            finish();
          }, 100);
        } else {
          finish();
        }

        function finish() {
          if (attrs.bptToggle === 'tooltip') {
            $(element).tooltip(options);

            if (attrs.bptShow) {
              $(element).on('show.bs.tooltip', scope[attrs.bptShow]);
            }

            if (attrs.bptHide) {
              $(element).on('hide.bs.tooltip', scope[attrs.bptHide]);
            }
          }

          if (attrs.bptToggle === 'popover') {
            $(element).popover(options);

            if (attrs.bptShow) {
              $(element).on('show.bs.popover', scope[attrs.bptShow]);
            }

            if (attrs.bptHide) {
              $(element).on('hide.bs.popover', scope[attrs.bptHide]);
            }
          }
        }
      }
    };
  });

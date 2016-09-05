'use strict';

angular
  .module('CopyTextComponentModule', [])

  .directive('copyText', function () {
    return {
      link: function(scope, element) {
        element.find('.form-control').on('click', function () {
          this.select();
        });

        var client = new ZeroClipboard(element.find('.btn-custom'));

        client.on('ready', function() {
          client.on('aftercopy', function() {
            element.find('.form-control').select();
            element.addClass('has-success');

            scope.copied = true;
            scope.$apply();
          });
        });
      }
    };
  });

'use strict';

angular
  .module('ErrorServiceModule', [
    'ErrorModalControllerModule'
  ])

  .factory('Error', function ($modal, Raven) {

    var activeModal = false;

    return {
      // Show a pretty modal with debug information about the error
      show: function (response) {

        if(response instanceof TypeError) {
          response = response.stack.toString();
          console.error(response);
        }

        if (activeModal)
        {
          Raven.captureMessage(JSON.stringify(response));

          return false;
        }

        var modalInstance = $modal.open({
          templateUrl: 'modals/error/error.template.html',
          windowClass: 'error-modal',
          resolve: {
            response: function() {
              return response;
            }
          },
          controller: 'ErrorModalController'
        });

        modalInstance.result.then(function () {
          activeModal = false;
        }, function () {
          activeModal = false;
        });

        activeModal = true;

      }
    };

  });

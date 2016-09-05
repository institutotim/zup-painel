/**
 * Created by Jairo on 19/07/2015.
 */
angular.module('ZupPrintDirectiveModule', [])
  .directive('zupPrint', function () {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {

        el.on('click', function(evt) {
          evt.preventDefault();
          print();
        });

        function removeIframe(printFrame) {
          printFrame.parentNode.removeChild(printFrame);
        }

        var timeoutId = null;

        function print() {
          var document = window.document;
          var printFrame = document.getElementById('zupPrintFrame');
          if (printFrame) {
            removeIframe(printFrame);
          }
          printFrame = document.createElement('iframe');
          document.body.appendChild(printFrame);
          printFrame.id = 'zupPrintFrame';
          printFrame.contentWindow.document.open();
          printFrame.contentWindow.document.write(
            '<html><head>' +
            '<style>' + 
              '@page {size: A4; margin: 50px;}' + 
              'div.report-image { width: 100%; text-align: left; }' + 
              'div.report-image img { max-width: 150px; padding: 5px; }' +
              'div.report-image span { display: inline-table; }' +
            '</style>' +
            '</head><body></body></html>');

          document.body.appendChild(printFrame);

          var divToPrint = document.getElementById(attrs.zupPrint);
          var cloneDiv = divToPrint.cloneNode(true);
          printFrame.contentWindow.document.body.appendChild(cloneDiv);
          printFrame.contentWindow.document.close();
          printFrame.contentWindow.print();

          if(timeoutId){
            window.clearTimeout(timeoutId);
          }
          timeoutId = window.setTimeout(removeIframe(printFrame), 2000);


        }

      }
    }

  }
);

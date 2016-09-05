angular
  .module('NextFieldOnEnterComponentModule', [])
  .directive('nextFieldOnEnter', function () {
    return function (scope, element, attrs) {
      var formInputs = element.find("input");
      if(attrs.nextFieldOnEnter) {
        var callback = scope.$eval(attrs.nextFieldOnEnter);
      }

      _.each(formInputs, function(formInput){
        angular.element(formInput).bind("keydown keypress", function (event) {
          if(event.which === 13) {
            scope.$apply(function (){
              var nextInput, nextInputIndex = formInputs.index(formInput) + 1;
              if(nextInput = formInputs.get(nextInputIndex)) {
                nextInput.focus();
                if(callback) {
                  callback(formInput, nextInput);
                }
              } else {
                callback(formInput, null);
              }
            });
            event.preventDefault();
          }
        });
      });

    };
  });

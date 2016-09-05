
module.exports = function () {
  this.World = require('../support/world').World;

  this.Before(function (scenario, callback) {
      this.visit('/').then(function(){
        callback();
      });
  });
  
  this.After(function (scenario, callback) {
    var page = this.pages.auth;

    page.isLogged().then(function(ok){
        if(ok){
          page.logout(callback)
        }else{
          callback();
        }
    });
  });
};

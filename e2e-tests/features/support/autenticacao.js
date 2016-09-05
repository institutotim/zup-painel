var ResetPass = require('./resetPass');

function AuteticationPage() {
  this.resetPass = new ResetPass(this);
}

AuteticationPage.prototype = {
  fillLogin:function(user, pass, done){
    var email = element(by.model('email'));
    var password = element(by.model('password'));

    return Promise.all([
      email.clear(),
      password.clear(),
    ]).then(function(){

      return Promise.all([
        email.sendKeys(user),
        password.sendKeys(pass)
      ]).then(function(){
        return done && done();
      });
    });
  },

  isLogged:function(){
    return element(by.css('.user_info')).isPresent()
  },

  login:function(done){
    return element(by.css('form[ng-submit="login()"] button[type="submit"]')).click().then(function(){
      return done && done();
    });
  },

  logout:function(done){
    var userInfo = element(by.css('.user_info'));
    var dropInfo = userInfo.element(by.css('.dropdown-toggle'));
    var logoutLink = userInfo.element(by.css('a[href="#/user/logout"]'));

    dropInfo.click().then(function(){
        logoutLink.click().then(function(){

          done && done();
        });
    });
  }
};

module.exports = AuteticationPage;

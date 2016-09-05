var chai = require('chai');
chai.use(require('chai-as-promised'));

var expect = chai.expect;

module.exports = function () {
  var page;

  this.World = require('../support/world').World;
  
  this.Given(/^tento finalizar a sessão$/, function (next) {
    page = this.pages.auth;
    
    page.logout(next);
  });

  this.Given(/^confirmo minha saída$/, function (next) {
    //TODO: provavalemente deveria aparecer um popup de confirmação
    //page.confirmLogout();
    next();
  });

  this.When(/^o sistema encerra minha sessão$/, function () {
    return expect(page.isLogged()).to.eventually.not.ok;
  });
};

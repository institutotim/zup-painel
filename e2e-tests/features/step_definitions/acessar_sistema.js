var chai = require('chai');
chai.use(require('chai-string'));

var expect = chai.expect;
var $URL_init = '/#/reports';

module.exports = function(){
  this.World = require('../support/world').World;

  this.Given(/^que acesso ao sistema$/, function(){
    return this.visit('/');
  });
  
  this.Given(/^que estou em uma tela do sistema$/, function (next) {
    this.currentUrl().then(function (url) {
      expect(url).to.endsWith($URL_init);
      next();
    });
  });
};

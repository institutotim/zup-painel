var chai = require('chai');
chai.use(require('chai-string'));
chai.use(require('chai-as-promised'));

var expect = chai.expect;

var $URL_login  = '/#/user/login';
var $USER_login = process.env.USER_EMAIL;
var $USER_pass  = process.env.USER_PASSWORD;

module.exports = function () {
  var page;

  this.World = require('../support/world').World;

  function makeLogin(next){
    page = this.pages.auth;

    page.fillLogin($USER_login, $USER_pass, function () {
      page.login(function () {
        expect(page.isLogged()).to.eventually.be.ok.and.notify(next);
      });
    });
  }
  
  function IamAuthUser(next) {
    page = this.pages.auth;

    expect(page.user).to.not.equal('');
    expect(page.pass).to.not.equal('');
    next();
  }

  this.Given(/^estou autenticado no sistema$/, makeLogin);
  this.Given(/^que estou autenticado na aplicação$/, makeLogin);
  this.Given(/^que estou autenticado$/, makeLogin);
  
  this.Given(/^que sou um usuário cadastrado no sistema$/, IamAuthUser);
  this.Given(/^que sou um usuário cadastrado$/, IamAuthUser);
  
  this.Given(/^ainda não estou logado$/, function () {
    return expect(page.isLogged()).to.eventually.not.ok;
  });

  this.Given(/^que estou na tela de autenticação$/, function (next) {
    expect(this.currentUrl()).to.eventually.match(/\/#\/user\/login$/).and.notify(next);
  });

  this.Given(/^preencho os dados do formulário corretamente$/, function (next) {
    page.fillLogin($USER_login, $USER_pass, next);
  });

  this.When(/^tento realizar autenticação$/, function (next) {
    page.login(next);
  });

  this.Then(/^o sistema cria uma sessão para o usuário$/, function () {
    return expect(page.isLogged()).to.eventually.ok;
  });

  this.Then(/^redireciona para a tela inicial do usuário$/, function (next) {
    this.currentUrl().then(function (actualUrl) {
      expect(actualUrl).to.not.endsWith($URL_login);
      next();
    });
  });

  this.Given(/^que preencho os dados do formulário de de autenticação com dados inexistentes$/, function (next) {
    page.fillLogin('aaaaaaa@mail.com', '123456', next);
  });

  this.Then(/^o sistema apresenta uma mensagem de erro informando que os dados estão incorretos$/, function () {
    var errorMsg = element(by.css('.loginError'));

    return Promise.all([
      expect(errorMsg.getText()).to.eventually.equal('Dados incorretos. Por favor, tente novamente.'),
      expect(errorMsg.isDisplayed()).to.eventually.ok
    ]);
  });

  this.Then(/^eu sou redirecionado para a tela de autenticação$/, function (done) {
    this.currentUrl().then(function (actualUrl) {
      expect(actualUrl).to.endsWith($URL_login);
      done();
    });
  });
}

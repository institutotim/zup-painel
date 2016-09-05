var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

module.exports = function () {
  var page;
  this.World = require('../support/world').World;

  this.Given(/^que estou na tela de recuperar a senha$/, function (next) {
    page = this.pages.auth;
    page.resetPass.open(next);
  });

  this.Given(/^que preencho os dados do formulário de recuperação de senha corretamente$/, function () {
    return page.resetPass.setEmail(process.env.USER_EMAIL);
  });

  this.When(/^clico no botão recuperar senha ou tecla enter$/, function () {
    return page.resetPass.send();
  });

  this.Then(/^o sistema envia um email com um link de recuperação de senha$/, function () {
    var msg = 'Pronto! Um email com instruções para você recuperar sua senha foi enviado.';

    return expect(page.resetPass.contentDialog()).to.eventually.equal(msg);
  });
};


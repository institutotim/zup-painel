module.exports = function(){
  this.World = require('../support/world').World;

  this.Given(/^que possuo permissão para visualizar relatos$/, function(next){
  	//TODO: implement in permission issue
  	next();
  });

  this.Given(/^que estou em um grupo que possui a permissão para excluir relatos e acessar o painel administativo$/, function (next) {
    next();
  });

  this.Given(/^o sistema deve me retornar a listagem de relatos das categorias que posso remover$/, function (next) {
    next();
  });

};

#language: pt

Funcionalidade: Remover relatos pelo painel ZUP
	Usuários com acesso privilegiados podem ter acesso a exclusão de relatos dentro do sistema ZUP.

Contexto:
	Dado que sou um usuário cadastrado no sistema
	E que estou autenticado
	E que estou em um grupo que possui a permissão para excluir relatos e acessar o painel administativo
	E o sistema deve me retornar a listagem de relatos das categorias que posso remover

Cenário: Excluir um relato na listagem com a confirmação de exclusão bem sucedida
	Dado que eu estou na listagem de relatos
	Quando clicar no ícone de exclusão
	E aparecer a confirmação de exclusão
	E digito a palavra deletar
	E clicar no botão remover
	Então o sistema deve retornar uma mensagem de remoção bem sucedida
	E atualizar a listagem de relatos

Cenário: Confirmação de exclusão mal sucedida
	Dado que eu estou na listagem de relatos
	Quando clicar no ícone de exclusão
	E aparecer a confirmação de exclusão
	E digito qualquer palavra que não seja deletar
	Então o sistema não deve ativar o botão remover

Cenário: Confirmar se o protocolo que eu estou deletando diz respeito ao relato que eu quero deletar
	Dado que eu estou na listagem de relatos
	E escolho o relato com protocolo #3414
	Quando clicar no ícone de exclusão deste relato
	E aparecer a confirmação de exclusão
	E leio a fraseologia de atenção
	Então confirmo que a fraseologia cita o protocolo #3414

Cenário: Confirmar se o endereço que eu estou deletando diz respeito ao relato que eu quero deletar
	Dado que eu estou na listagem de relatos
	E escolho o relato com protocolo localizado na R. Leonel Guarnieri
	Quando clicar no ícone de exclusão deste relato
	E aparecer a confirmação de exclusão
	E leio a fraseologia de atenção
	Então confirmo que a fraseologia cita o endereço R. Leonel Guarnieri


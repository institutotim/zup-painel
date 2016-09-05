#language: pt
@notimplemented
Funcionalidade: Visualizar e Editar relatos
	Como um usuário responsável por visualizar e editar relatos
	Quero poder visualizar e editar todos os relados que tenho permissão
	Para que eu possa ver a demanda e trabalhar na resolução do problema do solicitante

Contexto: 
	Dado que sou um usuário cadastrado no sistema
	E que estou autenticado
	E que o grupo que estou contido tenha a permissão "Visualizar e editar relatos" em uma ou mais categorias de relato
	Então o sistema deve me retornar a listagem de relatos das categorias
	
Cenário: Visualizar relatos
	Dado que eu estou dentro de um relato
	Então devo enxergar todos os campos e seções disponíveis no relato

Cenário: Alterar o endereço do relato
	Dado que eu estou dentro de um relato
	Quando clicar no botão editar no campo de endereço
	Então o sistema deve exibir os campos para edição do endereço
	E altero o campo digitando um novo endereço
	E seleciono uma sugestão do endereço do Google Maps
	E altero o campo número e dou enter
	E clico no botão salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração de endereço no histórico do relato

Cenário: Alterar a referência do endereço
	Dado que eu estou dentro de um relato
	Quando clicar no botão editar no campo de referência
	Então o sistema deve exibir o campo
	E altero as informações
	E clico no botão salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração de endereço no histórico do relato	

Cenário: Alterar a descrição do relato
	Dado que eu estou dentro de um relato
	Quando clicar no botão editar no campo descrição
	Então o sistema deve exibir o campo
	E altero as informações
	E clico no botão salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração da descrição no histórico do relato	

Cenário: Recategorizar o relato
	Dado que eu estou dentro de um relato
	Quando clicar no botão alterar no campo categoria
	E o grupo que estou contido possui permissão "Criar relatos" em alguma categoria de relato do sistema
	Então o sistema deve exibir a lista de categorias disponíveis
	E seleciono a categoria que desejo alterar
	Então o sistema exibe os estados da categoria escolhida
	E seleciono um estado
	E clico no botão Confirmar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração da categoria de relato no histórico do relato	

Cenário: Alterar o estado do relato
	Dado que eu estou dentro de um relato
	E a configuração na categoria de relato chamada "Obrigatoriedade de inserir um comentário ao alterar o status" esteja desativada
	Quando clicar no botão alterar status
	Então o sistema deve exibir o a lista dos estados disponíveis
	E seleciono um estado
	E clico no botão Salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração do estado no histórico do relato

Cenário: Alterar o estado do relato e fazer um comentário ao solicitante
	Dado que eu estou dentro de um relato
	E a configuração na categoria de relato chamada "Obrigatoriedade de inserir um comentário ao alterar o status" esteja ativada
	Quando clicar no botão alterar status
	Então o sistema deve exibir o a lista dos estados disponíveis
	E seleciono um estado
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração da categoria de relato no histórico do relato
	E exibe o comentário ao solicitante no histórico

Cenário: Alterar o grupo responsável pelo relato
	Dado que eu estou dentro de um relato
	E que existe mais de um grupo responsável adicionado na categoria de relato no campo "Grupos solucionadores"
	E que a opção "Obrigatoriedade de inserir um comentário interno ao encaminhar o relato" esteja desativada
	Quando clicar no botão alterar no campo grupo responsável
	Então o sistema deve listar os grupos disponíveis
	E seleciono um grupo
	E clico no botão Salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração do grupo responsável no histórico do relato

Cenário: Alterar o grupo responsável pelo relato e fazer uma observação interna
	Dado que eu estou dentro de um relato
	E que existe mais de um grupo responsável adicionado na categoria de relato no campo "Grupos solucionadores"
	E que a opção "Obrigatoriedade de inserir um comentário interno ao encaminhar o relato" esteja ativada
	Quando clicar no botão alterar no campo grupo responsável
	Então o sistema deve listar os grupos disponíveis
	E seleciono um grupo
	E descrevo a situação no campo de observações internas
	E clico no botão Salvar
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração do grupo responsável no histórico do relato
	E exibe a adição do texto em observações internas no histórico do relato

Cenário: Alterar o usuário responsável pelo relato
	Dado que eu estou dentro de um relato
	Quando clicar no botão alterar no campo usuário responsável
	Então o sistema deve listar os usuários do grupo responsável que está atribuído ao relato
	E clico no botão selecionar no usuário
	Então o sistema deve retornar uma mensagem de sucesso
	E exibe a alteração do grupo responsável no histórico do relato	

Cenário: Enviar uma resposta privada ao solicitante
	Dado que eu estou dentro de um relato
	Quando estou na seção "Respostas ao solicitante"
	E escrevo um comentário ao solicitante
	E seleciono a opção privado
	E clico no botão enviar
	Então o sistema exibe a mensagem enviada no painel e para o solicitante do relato
	E exibe a mensagem enviada no histórico do relato
	E exibe a mensagem apenas para o solicitante ou um usuário que pode acessar painel administrativo

Cenário: Enviar uma resposta pública ao solicitante
	Dado que eu estou dentro de um relato
	Quando estou na seção "Respostas ao solicitante"
	E escrevo um comentário ao solicitante
	E seleciono a opção público
	E clico no botão enviar
	Então o sistema exibe a mensagem enviada no painel e para qualquer outro usuário que acessar o relato
	E exibe a mensagem enviada no histórico do relato

Cenário: Escrever uma observação interna para o relato
	Dado que eu estou dentro de um relato
	Quando estou na seção "Observaçõe internas"
	E escrevo um texto
	E clico no botão publicar internamente
	Então o sistema exibe a mensagem enviada no painel
	E exibe a mensagem enviada no histórico do relato

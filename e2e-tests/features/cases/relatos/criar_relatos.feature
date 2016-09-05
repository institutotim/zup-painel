#language: pt
@notimplemented
Funcionalidade: Permitir que um usuário previamente cadastrado possa criar um relato
  Como um usuário responsável por reportar novos relatos diretamente no painel do sistema
  Quero ser capaz de reportar um relato
  Para que outras usuários possam realizar as tratativas necessárias para a resolução do problema

  Contexto:
    Dado que sou um usuário cadastrado no sistema
    E estou autenticado no sistema
    E que estou na listagem de relatos
    E o sistema deve exibir o botão + Novo Relato na listagem de relatos
    E clico no botão Novo Relato

  Cenário: Criar um relatos com imagens
    Dado que preencho os campos obrigatórios do relato
    E faço um upload de uma imagem
    Quando clico no botão criar relato
    E for redirecionado para a exibição dos dados do relato
    Então o sistema deve retornar uma mensagem de sucesso
    E devo visualizar uma aba "Imagens"
    E devo visualizar as imagens que fiz upload

  @notimplemented
  Cenário: Criar um relatos sem imagens
    Dado que preencho os campos obrigatórios do relato
    Quando clico no botão criar relato
    E for redirecionado para a exibição dos dados do relato
    Então o sistema deve retornar uma mensagem de sucesso
    E não devo visualizar uma aba "Imagens"
    E não devo visualizar a área de imagens

  @notimplemented
  Cenário: Criar um relato preenchendo os campos obrigatórios e visualizar seus dados
    Dado escolho a categoria "coleta de entulho"
    E preencho o endereço com "Rua Julieta vila jordanopolis, 167"
    E descrevo a situação com texto: "grande quantidade de lixo acumulado na rua"
    E seleciono o usuário "Garnet Price" como solicitante
    Quando clico no botão criar relato
    Então o sistema deve retornar uma mensagem de sucesso
    E devo visualizar o texto "Coleta de Entulho"
    E devo visualizar o texto "Rua Julieta, 167"
    E devo visualizar o texto "grande quantidade de lixo acumulado na rua"
    E devo visualizar o texto "Garnet Price"

  Cenário: Criar um relato e visualizar o histórico vinculado ao usuário atual
    Dado que preencho os campos obrigatórios do relato
    Quando clico no botão criar relato
    Então devo visualizar uma aba "Histórico"
    E devo visualizar o nome do usuário atual na area de Histórico

  @notimplemented
  #TODO: É necessario faze roolback dessa opereção no final do cenário,
  # pois não é permitido a inclusão de usuários com as mesmas informações

  Cenário: Criar um relato e cadastrar um novo solicitante
    Dado que preencho os campos obrigatórios do relato
    E clico no botão + Cadastro novo usuário
    E preencho os campos obrigatórios do usuário "José da Silva"
    Quando clico no botão criar usuário
    Então o sistema retorna a tela de criação do relato e exibe o nome do solicitante vinculado ao relato
    E clico no botão criar relato
    Quando for redirecionado para a exibição dos dados do relato
    Então devo visualizar o texto "José da Silva"

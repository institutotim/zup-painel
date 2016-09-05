#language: pt

  Funcionalidade: Permitir que um usuário previamente cadastrado possa listar todos os relatos do sistema
    Como um usuário do sistema
    Quero ser capaz de listar todos os relatos
    Para contribuir editanto os relatos devo ser capaz de visualizar qualquer um
    E ter permissão para editar

    Contexto:
      Dado que estou autenticado na aplicação
      E que estou na tela de relatos

    Cenário: Permitir que o usuário liste os relatos
      Dado que estou visualizando todos os relatos
      Então todas colunas devem estar devidamente preenchidas

    @notimplemented
    Cenário: Permitir que o usuário realizer busca utilizando os filtros
      Dado clico no campo para filtrar items
      Quando escolho um filtro
      E preencho todos dados necessarios para realizar a busca
      E clico no botão criar filtro
      Então devo visualizar somente os relatos que contem o mesmo valor inserido no filtro

    @notimplemented
    Cenário: Usuário a partir da tela de relatos deve ser capaz de editar
      Dado que pretendo editar um relato
      Então eu clico em cima do relato desejado
      E assim devo ser capaz de visualizar o botões de editar e alterar

    @notimplemented
    Cenário: Usuário a partir da tela de relatos deve ser capaz de visualizar o mesmo
      Dado que eu desejo visualizar um relato
      Então eu clico em cima do relato desejado
      E assim devo ser capaz de visualizar todos os dados do relato

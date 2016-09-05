#language: pt

  Funcionalidade: Permitir que um usuário previamente cadastrado tenha acesso ao sistema
    Como um usuário do sistema
    Quero ser capaz de acessar o sistema
    Para poder utilizar os recursos protegidos

    Contexto:
      Dado que sou um usuário cadastrado
      E ainda não estou logado

    Cenário: Permitir acesso ao sistema
      Dado que estou na tela de autenticação
      E preencho os dados do formulário corretamente
      Quando tento realizar autenticação
      Entao o sistema cria uma sessão para o usuário
      E redireciona para a tela inicial do usuário

    @notimplemented
    Cenário: Não permitir usuários com credenciais incorretas
      Dado que estou na tela de autenticação
      E que preencho os dados do formulário de de autenticação com dados inexistentes
      Quando tento realizar autenticação
      Então o sistema apresenta uma mensagem de erro informando que os dados estão incorretos




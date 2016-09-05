#language: pt

  Funcionalidade: Permitir que o usuário encerre sua sessão no sistema
    Como um usuário do sistema
    Quero ser capaz de encerrar minha sessão
    Para que matenha o acesso de minha conta liberado apenas enquanto uso

    Contexto:
      Dado que sou um usuário cadastrado
      E estou autenticado no sistema

    Cenário: Encerrar a sessão do sistema
      Dado que estou em uma tela do sistema
      Quando tento finalizar a sessão
      E confirmo minha saída
      Então o sistema encerra minha sessão
      E eu sou redirecionado para a tela de autenticação

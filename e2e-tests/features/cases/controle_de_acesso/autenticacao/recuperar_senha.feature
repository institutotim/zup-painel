#language: pt

  Funcionalidade: Permitir que um usuário previamente cadastrado recupere sua senha
    Como um usuário do sistema
    Quero ser capaz de recuperar a minha senha
    Para que consiga acesso a minha conta caso esqueça informações para autenticação

    Contexto:
      Dado que sou um usuário cadastrado
      E ainda não estou logado

    Cenário: Permitir usuários recuperarem a senha
      Dado que estou na tela de recuperar a senha
      E que preencho os dados do formulário de recuperação de senha corretamente
      Quando clico no botão recuperar senha ou tecla enter
      Então o sistema envia um email com um link de recuperação de senha

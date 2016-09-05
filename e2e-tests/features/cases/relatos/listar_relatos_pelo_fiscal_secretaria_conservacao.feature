#language: pt
@notimplemented
  Funcionalidade: gerente de conservação lista relatos
    Nota: os filtros já existentes no painel do ZUP foram omitidos.
    Como fiscal da secretaria de Conservação
    Quero listar relatos realizados
    Para que possa atribuir relatos a fiscais e enviar notificações

    Contexto:
      Dado que estou autenticado na aplicação
      E que possuo permissão para visualizar relatos
      E que existem relatos cadastrados

    Cenário: com filtro de número de notificações
      Dado que escolhi 1 para o filtro de número de notificações
      E existem relatos que já possuem uma notificação emitida
      Quando carrego a lista de relatos
      Então a lista trás relatos que possuem ao menos 1 notificação
      E nenhum outro relato
      E ordena por data de criação mais recente

    Cenário: com filtro de dias desde emissão da última notificação
      Dado que escolhi de 3 a 7 dias no filtro de dias desde emissão da última notificação
      E existem relatos com notificações emitidas entre 3 a 7 dias atrás
      Quando carrego a lista de relatos
      Então a lista trás apenas relatos que possuem notificações emitidas entre 3 a 7 dias atrás
      E nenhum outro relato
      E ordena por data de criação mais recente

    Cenário: com filtro de dias para o vencimento da última notificação
      Dado que escolhi de 3 a 7 dias o filtro de notificações a vencer
      E existem relatos com notificações a vencer entre 3 e 7 dias
      Quando carrego a lista de relatos
      Então a lista trás apenas relatos que possuem notificações a vencer entre 3 e 7 dias
      E nenhum outro relato
      E ordena por data de criação mais recente

    Cenário: com filtro de dias em atraso para notificações vencidas
      Dado que escolhi em 7 dias o filtro de notificações vencidas
      E existem relatos com notificações vencidas a mais de 7 dias
      Quando carrego a lista de relatos
      Então a lista trás apenas relatos que possuem notificações vencidas a mais pelo menos 7 dias
      E nenhum outro relato
      E ordena por data de criação mais recente

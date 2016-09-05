# Changelog

## 1.2.0 - 05/09/2016
### Novas funcionalidades
- [Relatórios] Novo sistema de relatórios baseado em OLAP
- [Localidades] Implementação de limite de acesso a recursos baseado em localidades (namespaces).
- [Inventário] Possibilidade de selecionar um campo para ser usado como título do item
- [Relatos] Implementado campos personalizáveis

### Correções
- [Fluxos e casos] Correção de diversos problemas com permissionamento e avanço de etapas

## 1.1.10 - 10/06/2016
### Novas funcionalidades
- [Serviços] Nova interface para gerenciamento de serviços
### Melhorias
- [Geral] Exibe a versão do sistema no menu
### Correções
- [Relatos] Correção na listagem de usuários em filtros por usuário

## 1.1.10 - 16/05/2016
### Melhorias
- [Relatos] Adicionada nova configuração global: esconder seção de resposta ao solicitante

## 1.1.9 - 26/04/2016
### Correções
- [Inventário] Corrige a rota de adição de uma nova categoria
- [Usuários] Corrige a exibição de erros na tela de criação de usuários em relatos
- [Autorização] Corrige a verificação de permissões
### Outras mudanças
- Alteração do logo da TIM

## 1.1.8 - 18/04/2016
### Melhorias
- [Autenticação] Melhorias na autenticação do usuário
- [Relatos] Melhoria na exibição de impressão
### Correções
- [Usuários] Correção no problema ao acessar página de alguns usuários

## 1.1.7 - 13/04/2016
### Melhorias
- [Relatos] Nova seção exibindo denúncias de um relato
- [Relatos] Criado filtro por grupo responsável na listagem de relatos
### Correções
- [Relatos] Correção no seletor de cores para status de categoria de relato
- [Usuários] Correção na listagem de usuários quando acessada diretamente pela URL
- [Inventário] Correção do título do estado no histórico do inventário

## 1.1.6 - 29/03/2016
### Correções
- [Inventário] Corrige problema de travamento do navegador ao voltar da tela de edição de categoria
### Melhorias
- [Busca] Melhoria de buscas no sistema

## 1.1.5 - 15/03/2016
### Melhorias
- [Relatos] Exibe apenas grupo solucionadores da categoria na lista de seleção de grupo solucionador padrão
- [Interface] Aumento do tempo de permanência de mensagens de erros para 10 segundos

## 1.1.4 - 01/03/2016
### Adições e melhorias
- [Inventário] Melhoria no tratamento de erros ao criar e editar items de inventário
- [Inventário] Desabilita botão de salvar até todos os campos obrigatórios serem preenchidos
### Correções
- [Inventário] Corrige listagem de estados no filtro de estados de inventário
- [Inventário] Atualiza dados de um inventário ao terminar de editar
- [Inventário] Corrige validação de presença em campos de múltipla escolha
- [Inventário] Corrige validação de presença em seções e campos
- [Relatos] Corrige exibição do número de protocolo quando o usuário não tem permissão de visualização
- [Relatos] Corrige sobreposição de campos de endereço em telas de baixa resolução
- [Relatos] Corrige quebra de página e impressão do logotipo
- [Relatos] Corrige exibição da categoria na listagem
- [Usuários] Corrige a listagem de grupos de um usuário de acordo com as permissões do usuário logado
- [Usuários] Corrige a exibição da aba Usuários somente se o usuário tiver permissão
- [Usuários] Exibir os botões de gerenciar usuário quando o usuário logado tiver permissão
- [Usuários] Corrige a exibição de erros ao cadastrar usuários
- [Grupos] Valida permissão do usuário ao visualizar um grupo
- [Permissões] Seleciona automaticamente categoria pai sempre que subcategorias são selecionadas
- [Permissões] Corrige listagem de relatórios

## 1.1.3 - 22/12/2015
### Correções
- [Configuração] Agora é possível trocar corretamente ambas imagens usadas como logo (clara e escura)

## 1.1.2 - 19/12/2015
### Correções
- [Relatos] Corrige quebra de linha nas responstas ao solicitante do relato
- [Relatos] Corrige a exibição do mapa ao imprimir um relato
- [Relatos/Inventários] Correção na atualização do bairro na seleção de endereço
- Corrige fraseologia do histórico para mudança de perímetro

## 1.1.1 - 27/11/2015
### Correções
- [Relatos] Corrigido exibição da lista de categorias

## 1.1.0
### Adicionado
- Campos extras em usuários
- Filtro "Por perímetro de encaminhamento.." na busca de relatos
- Adicionado campo "Perímetro" na exibição do relato
- Incluído pesquisa por nome na listagem de perímetros
- Incluído caixa de seleção de grupo solucionador padrão para o perímetro
- Adicionado o campo de prioridade aos relatos

### Corrigido
- Incluído scroll infinito na listagem de grupos por perímetros na edição da categoria
- Removido scroll infinito da listagem de grupos por perímetros e aplicado novo formato de renderização
- Ajustado resolução das imagens do relato
- Corrigido back do browser na edição da categoria de itens de inventário
- Melhoria no feedback ao usuário quando na alteração da referência do relato
- Modificado label "Comentário ao munícipe" para "Resposta ao solicitante" (modal de alteração do status do relato)
- Atualização do componente panzoom e ajuste em sua configuração para permitir o deslocamento da imagem no modal de visualização
- Ajustes visuais na tabela de listagem de notificações (header e texto prazo)
- Ajustes visuais na caixa drag-n-drop de upload de imagens do relato
- Ajustes na listagem de perímetros (shapefiles) e comportamento de consulta
- Corrigido posicionamento z-index da caixa de sugestão auto-complete do componente de escolha de endereço
- Corrigido posicionamento z-index do filtro "Por campos..." para os itens de inventários
- Corrigido exibição da lista de categorias na criação do relato

## 1.0.4
### Corrigido
- Corrigido atualização das informações de grupo responsável e histórico do relato quando há atualização do endereço
- Corrigido formatação de data na lista de shapefiles cadastrados
- Ajustado filtro de transformação da resposta da API do google maps para endereço (bairro)
- Ajustado ordenamento dos registros de log para os itens de inventário

## 1.0.3
### Adicionado
- Adicionado cadastro de shapefiles para configuração das categorias
- Diretiva de seleção em linha de permissões de grupos de usuário
### Corrigido
- Corrigido comportamento incorreto do posicionamento dos popovers.
- Variáveis de ambiente que estavam faltando no build.
- Ao remover gatilhos agora exibe uma modal de confirmação.
- Permissões das notificações
- Indentação em inúmeras partes do sistema.
- Correção nas cores das categorias
- Adicionado suporte a reordenação de gatilhos.
- Corrigido bug em resolução de estados que não permitia criar um item novo com o mesmo nome de outro previamente removido.
- Corrigida versão utilizada da jQuery.
- Não exibe área de notificações se a categoria de relato não tem notificações
- Revertida mudança de merge que omitiu as permissões de relatórios na edição de grupos
- Ajustado atributo z-index do pickcolor na edição da categoria de inventário
- Corrigido bug de z-index no componente de autocomplete
- Alterado todos os rótulos de "munícipe" para "solicitante"

## 1.0.2
### Adicionado
- Nova funcionalidade de notificações
- Correções nas dependências
- Campo para inserir legendas em imagens de relato

## 1.0.1
### Corrigido
- Correções na seção de histórico de alterações do relato.
- Correção na listagem dinâmica de usuários do grupo

### Adicionado
- Alteração do tema do painel através de variáveis de ambiente

## 1.0.0

Versão estável inicial

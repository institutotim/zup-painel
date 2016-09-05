'use strict';

angular
  .module('ConfigControllerModule', [
    'FeatureFlagComponentModule',
    'ConfigServiceModule'
  ])
  .controller('ConfigController', function ($scope, flagsResponse, ConfigService) {
    var availableFlags = {
      'explore': {
        name: 'Explorar o mapa',
        desc: 'Permite visualizar os relatos publicados por outros usuário em um mapa. As informações pessoais destes usuários não são exibidas nos relatos.',
        mobileConfig: true
      },
      'create_report_clients': {
        name: 'Criar relatos',
        desc: 'Permite que cidadãos possam criar os relatos.',
        mobileConfig: true
      },
      'create_report_panel': {
        name: 'Criar relato pelo painel administrativo',
        desc: 'Permite que usuários do painel administrativo possam criar relatos dos usuários. Ideal para atendimento ao solicitante (156) e prestadora de serviços.',
        mobileConfig: false
      },
      'stats': {
        name: 'Estatísticas',
        desc: 'Permite que os usuários visualizem estatísticas globais dos status dos relatos. As informações detalhadas não é exibida nesta interface, apenas a somatória de todos os relatos dentro daquele status específicos.',
        mobileConfig: true
      },
      'social_networks_facebook': {
        name: 'Compartilhamento do relato no Facebook',
        desc: 'Permite que o usuário, ao publicar um novo relato, compartilhe no Facebook. Se desativado o usuário não pode conectar sua conta do Facebook no aplicativo e também não é exibido o botão de compartilhamento.',
        mobileConfig: true
      },
      'social_networks_twitter': {
        name: 'Compartilhamento do relato no Twitter',
        desc: 'Permite que o usuário, ao publicar um novo relato, compartilhe no Twitter. Se desativado o usuário não pode conectar sua conta do Twitter no aplicativo e também não é exibido o botão de compartilhamento.',
        mobileConfig: true
      },
      'social_networks_gplus': {
        name: 'Compartilhamento do relato no Google Plus',
        desc: 'Permite que o usuário, ao publicar um novo relato, compartilhe no Google Plus. Se desativado o usuário não pode conectar sua conta do Google Plus no aplicativo e também não é exibido o botão de compartilhamento.',
        mobileConfig: true
      },
      'allow_photo_album_access': {
        name: 'Permitir acesso ao album de fotos',
        desc: 'Permite que o usuário, ao publicar um novo relato, selecione uma foto do próprio album para inserir no relato. Se desativado o usuário só poderá fazer uma fotografia ou continuar sem enviar nenhuma foto.',
        mobileConfig: true
      },
      'cases': {
        name: 'Casos',
        desc: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.',
        mobileConfig: false
      },
      'inventory': {
        name: 'Inventário',
        desc: 'O sistema ZUP permite que instituições e empresas criem qualquer tipo de inventário georeferenciado. O usuário com permissão de acesso às categorias de inventário tem a liberdade de criar campos diretamente pelo painel, para que outros usuários possam criar os itens de inventário relacionado a categoria e fazer a gestão deste itens de inventário utilizando diversas ferramentas disponíveis.',
        mobileConfig: false
      },
      'reports': {
        name: 'Relatos',
        desc: 'A categoria de relato permite que empresas e instituições criem um canal de comunicação com os seus clientes e usuários, permitindo que os usuários relatem problemas. É possível criar ilimitadas categorias de relatos, é permitido que estas categorias possam ser disponibilizadas aos usuários nos aplicativos ou privado, isto é, só será permitido que usuários com acesso ao Painel ZUP possa criar os relatos.',
        mobileConfig: false
      },
      'show_resolution_time_to_clients': {
        name: 'Exibir o tempo de resolução do relato para os usuários',
        desc: 'Quando o usuário cria um relato, é exibido uma mensagem de agradecimento e o tempo de resolução do relato. Se desativado, esta mensagem do tempo é ocultada.',
        mobileConfig: true
      },
      'show_answer_to_requester': {
        name: 'Responder ao solicitante', 
        desc: 'Exibe o campo que permite responder ao solicitante na tela de visualização do relato, no modal de alteração de status, no relato no aplicativo técnico e no modal de alteração de status no aplicativo técnico', 
        mobileConfig: true
      }
    };

    var flags = angular.copy(flagsResponse.data);

    for (var i = flags.length - 1; i >= 0; i--) {
      var originalName = flags[i].name;

      if (typeof availableFlags[originalName] !== 'undefined') {
        flags[i].name = availableFlags[originalName].name; // translate name
        flags[i].desc = availableFlags[originalName].desc;
        flags[i].mobileConfig = availableFlags[originalName].mobileConfig;
        flags[i].enabled = flags[i].status === 'disabled' ? false : true;
      }
    }

    $scope.flags = flags;

    ConfigService.getReportsColumns().then(function (columns) {
      $scope.reportsColumns = columns;
    });

    $scope.$watch('reportsColumns', function(newVal, oldVal){
      if(newVal && oldVal) {
        ConfigService.updateReportsColumns(newVal);
      }
    }, true);

    $scope.reportColumnsSortableOptions = {
      handle: '.handle',
      stop: function (e, ui) {
      },
      start: function (e, ui) {
        ui.placeholder.height(ui.item.height());
      },
      tolerance: 'pointer',
      items: 'li',
      revert: true,
      placeholder: 'sortable-placeholder'
    };
  });

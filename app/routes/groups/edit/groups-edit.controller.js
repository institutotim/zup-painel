/*global angular, _*/
'use strict';

angular
  .module('GroupsEditControllerModule', [
    'DiacriticsInsensitiveFilterHelperModule'
  ])

  .controller('GroupsEditController', function ($scope, $rootScope, Restangular, $stateParams, $location, $timeout, groupResponse, permissionsResponse, Resource, objectsResponse, $translate) {
    var isService = $scope.isService = Resource.route === 'services';
    $scope.resource = Resource;
    $scope.group = groupResponse.data;
    $scope.permissions = permissionsResponse.data;
    $scope.groups = objectsResponse.data.groups;
    $scope.flows = objectsResponse.data.flows;
    $scope.namespaces = objectsResponse.data.namespaces;
    $scope.chat_rooms = objectsResponse.data.chat_rooms;
    $scope.inventoriesCategories = objectsResponse.data.inventory_categories;
    $scope.reportsCategories = objectsResponse.data.reports_categories;
    $scope.businessReports = objectsResponse.data.business_reports;
    $scope.availablePermissionTypes = [];
    $scope.newPermission = { type: null, objects: [], slugs: [] };

    $scope.isString = function (variable) {
      return typeof variable === 'string';
    };

    $translate(['REPORTS', 'REPORTS_ATTRIBUTES_CATEGORIES', 'REPORT', 'REPORTS_ATTRIBUTES_CATEGORY']).then(function (translations) {
      // available types
      $scope.availablePermissionTypes = $scope.availablePermissionTypes.concat([
        {
          type: 'user',
          name: 'Usuários',
          permissionsNames: [
            {
              slug: 'users_full_access',
              name: 'Gerenciar todos os usuários',
              needsObject: false,
              tooltip: 'Ao ativar essa opção, será permitido que este grupo possa ver, adicionar e remover todos os usuários dos grupos às quais tem permissão de visualizar.'
            },
            {
              slug: 'users_read_private',
              name: 'Ver dados privados dos usuários',
              needsObject: false,
              tooltip: 'Ao ativar essa opção, será permitido que este grupo possa ver informações sensitivas de todos os usuários, como o CPF, Data de Nascimento e etc.'
            },
            {
              type: 'group',
              slug: 'users_edit',
              name: 'Gerenciar usuários de um grupo específico',
              needsObject: true,
              tooltip: 'Ao ativar essa opção, será permitido que este grupo possa visualizar, adicionar e remover todos os usuários dos outros grupos que você selecionar para esta permissão.'
            },
            {
              slug: 'manage_services',
              name: 'Gerenciar integração com serviços',
              needsObject: false,
              tooltip: 'Ao ativar essa opção, será permitido que este grupo possa utilizar os serviços de integração.'
            }
          ]
        },
        {
          type: 'group',
          name: 'Grupos',
          permissionsNames: [
            {
              slug: 'groups_full_access',
              name: 'Gerenciar todos os grupos',
              needsObject: false,
              tooltip: 'Selecionada esta opção, o grupo obtém todas as permissões de edições sobre todos os grupos existentes, sobre novos grupos adicionados no futuro, e sobre todos os usuários pertencentes a todos os grupos. Também permite a visualização e edição de dados dos usuários, buscar, deletar e adicionar usuários.'
            },

            {
              slug: 'group_edit',
              name: 'Editar e visualizar o grupo',
              needsObject: true,
              tooltip: 'Permite sobre os grupos selecionados: a visualização e edição de dados dos usuários, buscar, deletar e adicionar usuários. Permite a edição das permissões dos grupos selecionados.'
            },

            {
              slug: 'group_read_only',
              name: 'Visualizar o grupo',
              needsObject: true,
              tooltip: 'Permite acessar a listagem de grupos selecionados, visualizar quais os usuários estão dentro do grupo. Nesta permissão o usuário não tem permissão de adicionar, deletar ou editar os grupos, usuários e permissões.'
            }
          ]
        },
        {
          type: 'other',
          name: 'Configurações',
          permissionsNames: [
            {
              slug: 'panel_access',
              name: 'Acesso ao painel permitido',
              needsObject: false
            },
            {
              slug: 'manage_config',
              name: 'Gerenciar configurações do sistema',
              needsObject: false
            }
          ]
        },
        {
          type: 'inventory',
          name: 'Inventário',
          serviceAllowed: true,
          permissionsNames: [
            {
              slug: 'inventories_full_access',
              name: 'Gerenciar todas as categorias',
              needsObject: false,
              tooltip: 'Ativada esta opção, o grupo obtém todas as permissões de edição sobre todas as categorias de inventário existentes, sobre novas categorias adicionados no futuro, e sobre todos os formulários pertencentes a todas as categorias. Também permite a visualização e edição de dados dos itens de inventário, buscar, deletar e adicionar itens de inventário.'
            },
            {
              slug: 'inventories_formulas_full_access',
              name: 'Gerenciar fórmulas',
              needsObject: false,
              needsPermission: 'inventories_full_access'
            },

            {
              slug: 'inventories_categories_edit',
              name: 'Editar a categoria',
              needsObject: true,
              disableFields: ['inventories_items_edit', 'inventories_items_create', 'inventories_items_delete', 'inventories_items_create', 'inventories_items_read_only'],
              tooltip: 'Permite sobre as categorias selecionadas: a visualização e edição de dados dos itens de inventário, buscar, deletar e adicionar itens de inventário. Permite a edição dos campos de formulários das categorias selecionadas.'
            },

            {
              slug: 'inventories_items_create',
              name: 'Criar novos itens',
              needsObject: true,
              tooltip: 'Ao selecionar quais categorias de inventário o grupo terá acesso, os usuários poderão apenas adicionar itens de inventário sobre as categorias selecionadas, além de poder visualizar os itens que o próprio usuário criou.'
            },

            {
              slug: 'inventories_items_edit',
              name: 'Visualizar e editar itens',
              needsObject: true,
              tooltip: 'Ao selecionar quais categorias de inventário o grupo terá acesso, os usuários poderão visualizar e editar os itens de inventário das categorias selecionadas. Essa opção automaticamente ativará a permissão "Visualizar itens".'
            },
            {
              slug: 'inventories_items_delete',
              name: 'Remover itens',
              needsObject: true,
              tooltip: 'Ao selecionar quais categorias de inventário o grupo terá acesso, os usuários poderão visualizar e excluir os itens de inventário das categorias selecionadas. Essa opção automaticamente ativará a permissão "Visualizar itens".'
            },
            {
              slug: 'inventories_items_read_only',
              name: 'Listar itens',
              needsObject: true,
              tooltip: 'Essa opção permitirá que os usuários deste grupo possam listar os itens de inventário das categorias de inventário selecionadas. Para que os campos possam ser visualizados, é necessário acessar as categorias e adicionar as permissões de visualização ou edição para cada grupo nas seções ou campos desejados.'
            }
          ]
        },
        {
          type: 'report',
          name: translations.REPORTS,
          serviceAllowed: true,
          permissionsNames: [
            {
              slug: 'reports_full_access',
              name: 'Gerenciar todas as ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase(),
              needsObject: false,
              tooltip: 'Selecionada esta opção, o grupo obtém todas as permissões de edição sobre todas as ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' de ' + translations.REPORTS.toLowerCase() + ' existentes, sobre novas ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' adicionados no futuro, e sobre todos os ' + translations.REPORTS.toLowerCase() +' criados pertencentes a todas as ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + '. Também permite a visualização e edição de dados dos ' + translations.REPORTS.toLowerCase() + ', buscar, deletar e adicionar ' + translations.REPORTS.toLowerCase()
            },
            {
              slug: 'reports_categories_edit',
              name: 'Parametrizar as ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase(),
              disableFields: ['reports_items_create', 'reports_items_delete', 'reports_items_edit', 'reports_items_read_public', 'reports_items_read_private', 'reports_items_forward', 'reports_items_create_internal_comment', 'reports_items_alter_status', 'reports_items_create_comment',],
              needsObject: true,
              tooltip: 'Permite sobre as ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas: a visualização e edição de dados dos ' + translations.REPORTS.toLowerCase() + ', buscar, deletar e adicionar relatos. Permite a edição dos parâmetros das ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas.'
            },

            {
              slug: 'reports_items_edit',
              name: 'Visualizar e editar ' + translations.REPORTS.toLowerCase(),
              needsObject: true,
              tooltip: 'Permite visualizar e editar os ' + translations.REPORTS.toLowerCase() + ' das ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas.',
              disableFields: ['reports_items_forward', 'reports_items_create_internal_comment', 'reports_items_alter_status', 'reports_items_create_comment', 'reports_items_read_public', 'reports_items_read_private']
            },

            {
              slug: 'reports_items_create',
              name: 'Criar novos ' + translations.REPORTS.toLowerCase(),
              needsObject: true,
              tooltip: 'Permite que os usuários do painel possam adicionar novos ' + translations.REPORTS.toLowerCase() + ' às ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas.'
            },

            {
              slug: 'reports_items_delete',
              name: 'Remover ' + translations.REPORTS.toLowerCase(),
              needsObject: true,
              needsPermission: 'reports_items_read_private',
              tooltip: 'Permite visualizar e deletar os ' + translations.REPORTS.toLowerCase() + ' das ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas.'
            },

            {
              slug: 'reports_items_read_private',
              name: 'Visualizar ' + translations.REPORTS.toLowerCase() + ' completo',
              needsObject: true,
              tooltip: 'Permite a visualização completa de todos os campos disponíveis nos ' + translations.REPORTS.toLowerCase() + ' das ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' selecionadas.'
            },

            {
              slug: 'reports_items_read_public',
              name: 'Visualizar ' + translations.REPORTS.toLowerCase() + ' parcial',
              needsObject: true,
              tooltip: 'A visualização de ' + translations.REPORT.toLowerCase() + ' parcial é uma permissão que restringe o acesso as informações do ' + translations.REPORT.toLowerCase() + ', isto é, os usuários do grupo não poderão visualizar as observações internas, as respostas enviadas ao solicitante no modo privado e o protocolo. Os usuário exergarão todas as demais informações da tela.'
            },

            {
              slug: 'reports_items_forward',
              name: 'Encaminhar ' + translations.REPORTS.toLowerCase(),
              needsObject: true,
              tooltip: 'Grupo pode encaminhar item de ' + translations.REPORT.toLowerCase() + ' da ' + translations.REPORTS_ATTRIBUTES_CATEGORY.toLowerCase() + ' atribuída.'
            },

            {
              slug: 'reports_items_create_internal_comment',
              name: 'Inserir observações internas',
              needsObject: true,
              tooltip: 'Grupo pode inserir uma observação interna nos ' + translations.REPORTS.toLowerCase() + ' da ' + translations.REPORTS_ATTRIBUTES_CATEGORY.toLowerCase() + ' atribuída.'
            },

            {
              slug: 'reports_items_alter_status',
              name: 'Alterar o estado do ' + translations.REPORT.toLowerCase(),
              needsObject: true,
              tooltip: 'Grupo pode alterar o estado de ' + translations.REPORTS.toLowerCase() + ' da ' + translations.REPORTS_ATTRIBUTES_CATEGORY.toLowerCase() + ' atribuída.'
            },

            {
              slug: 'reports_items_create_comment',
              name: 'Enviar comentários ao solicitante',
              needsObject: true,
              tooltip: 'Grupo pode adicionar comentário público ou privado nos ' + translations.REPORTS.toLowerCase() + ' da ' + translations.REPORTS_ATTRIBUTES_CATEGORY.toLowerCase() + ' atribuída.'
            },

            {
              slug: 'reports_items_send_notification',
              name: 'Enviar notificação de ' + translations.REPORTS.toLowerCase(),
              needsObject: true,
              tooltip: 'Grupo pode enviar e reenviar notificações.'
            },

            {
              slug: 'reports_items_restart_notification',
              name: 'Reeiniciar processo de notificação de '+ translations.REPORTS.toLowerCase(),
              needsObject: true,
              tooltip: 'Grupo pode reiniciar todo o processo de notificações.'
            }
          ]
        },
        {
          type: 'business_report',
          name: 'Relatórios',
          permissionsNames: [
            {
              slug: 'business_reports_edit',
              name: 'Gerenciar relatórios',
              needsObject: false
            },
            {
              slug: 'business_reports_view',
              name: 'Visualizar relatório específico',
              needsObject: true
            }
          ]
        },
        {
          type: 'chat',
          name: 'Chat',
          permissionsNames: [
            {
              slug: 'manage_chat_rooms',
              name: 'Gerenciar salas de chat',
              needsObject: false
            },
            {
              slug: 'chat_rooms_read',
              name: 'Participar de uma sala de chat específica',
              needsObject: true
            }
          ]
        },
        {
          type: 'case',
          name: 'Casos',
          permissionsNames: [
            {
              slug: 'manage_cases',
              name: 'Gerenciar casos',
              needsObject: false
            },
            {
              slug: 'cases_with_reports_view',
              name: 'Visualizar casos com ' + translations.REPORTS_ATTRIBUTES_CATEGORIES.toLowerCase() + ' de relato',
              needsObject: true
            }
          ]
        },
        {
          type: 'namespace',
          name: 'Localidade',
          permissionsNames: [
            {
              slug: 'manage_namespaces',
              name: 'Gerenciar localidades',
              needsObject: false
            },
            {
              slug: 'namespaces_access',
              name: 'Visualizar localidade',
              needsObject: true
            }
          ]
        }
      ]);
    });

    if ($rootScope.flowsEnabled) {
      var flowsPermissions = {
        type: 'flow',
        name: 'Fluxos',
        permissionsNames: [
          {
            slug: 'flow_can_delete_own_cases',
            name: 'Remover casos próprios',
            needsObject: true
          },

          {
            slug: 'flow_can_execute_all_steps',
            name: 'Executar todas etapas',
            needsObject: true
          },

          {
            slug: 'flow_can_view_all_steps',
            name: 'Visualizar todas etapas',
            needsObject: true
          },

          {
            slug: 'can_execute_step',
            name: 'Executar etapa',
            needsObject: true
          },

          {
            slug: 'flow_can_change_cases_responsible',
            name: 'Alterar responsável de todos os casos',
            needsObject: true
          },

          {
            slug: 'can_view_step',
            name: 'Visualizar etapa',
            needsObject: true
          },

          {
            slug: 'manage_flows',
            name: 'Gerenciar fluxos',
            needsObject: false
          },

          {
            slug: 'flow_can_delete_all_cases',
            name: 'Remover todos casos',
            needsObject: false
          }
        ]
      };

      $scope.availablePermissionTypes.push(flowsPermissions);
    }

    $scope.isAllowed = function (permissionType) {
      return (isService && permissionType.serviceAllowed) || !isService;
    };

    // getters
    var getType = $scope.getType = function (type) {
      for (var i = $scope.availablePermissionTypes.length - 1; i >= 0; i--) {
        if ($scope.availablePermissionTypes[i].type === type) return $scope.availablePermissionTypes[i];
      }

      return null;
    };

    $scope.getTypeName = function (permission) {
      if (!permission) {
        return;
      }

      if (permission && _.isArray(permission.permission_names) && permission.permission_names[0] == 'users_edit') {
        return 'Usuários';
      }

      return getType(permission.permission_type) ? getType(permission.permission_type).name : permission.permission_type;
    };

    $scope.getTypePermissions = function (type) {
      return getType(type) ? getType(type).permissionsNames : null;
    };

    var getPermission = function (type, slug) {
      type = getType(type);

      if (!type) {
        return null;
      }

      for (var i = type.permissionsNames.length - 1; i >= 0; i--) {
        if (type.permissionsNames[i].slug === slug) {
          return type.permissionsNames[i];
        }
      }

      return null;
    };

    $scope.getPermissionsExcerpt = function () {
      switch ($scope.newPermission.slugs.length) {
        case 0:
          return 'Selecione a permissão';
          break;

        case 1:
          return $scope.getPermissionName($scope.newPermission.type, $scope.newPermission.slugs[0]);
          break;

        default:
          return $scope.newPermission.slugs.length + ' permissões selecionadas';
      }
    };

    $scope.isPermissionSelected = function (slug) {
      var i = $scope.newPermission.slugs.indexOf(slug);

      return i !== -1;
    };

    var selectedSpecialFields = [];

    $scope.togglePermission = function (permission) {
      var i = $scope.newPermission.slugs.indexOf(permission.slug);

      if (i === -1) {
        $scope.newPermission.slugs.push(permission.slug);

        if (permission.type) {
          $scope.newPermission.actual_type = permission.type;
        }

        if (!_.isUndefined(permission.needsPermission) && ($scope.newPermission.slugs.indexOf(permission.needsPermission) === -1)) {
          $scope.togglePermission(getPermission($scope.newPermission.type, permission.needsPermission));
        }

        if (!_.isUndefined(permission.disableFields)) {
          selectedSpecialFields.push(permission);
        }
      } else {
        $scope.newPermission.slugs.splice(i, 1);

        if (!_.isUndefined(permission.disableFields)) {
          selectedSpecialFields.splice(selectedSpecialFields.indexOf(permission), 1);
        }
      }
    };

    $scope.getObjectsExcerpt = function () {
      switch ($scope.newPermission.objects.length) {
        case 0:
          return 'Selecione um item';
          break;

        case 1:
          return $scope.newPermission.objects[0].name || $scope.newPermission.objects[0].title;
          break;

        default:
          return $scope.newPermission.objects.length + ' categorias selecionadas';
      }
    };

    $scope.isObjectSelected = function (objectId) {
      for (var i = $scope.newPermission.objects.length - 1; i >= 0; i--) {
        if ($scope.newPermission.objects[i].id === objectId) return true;
      }

      return false;
    };

    $scope.toggleChildObject = function (object, parent) {
      var objectIndex = findIndex($scope.newPermission.objects, function (obj) {
        return obj.id === object.id;
      });

      if (objectIndex !== -1) {
        $scope.newPermission.objects.splice(objectIndex, 1);
      } else {
        if (!_.isUndefined(parent) && !$scope.isObjectSelected(parent.id)) {
          $scope.newPermission.objects.push(parent);
        }

        $scope.newPermission.objects.push(object);
      }
    };

    $scope.toggleObject = function (object, childs) {
      var objectIndex = findIndex($scope.newPermission.objects, function (obj) {
        return obj.id === object.id;
      });

      if (objectIndex !== -1) {
        // Remove all childs
        _.each(childs, function (child) {
          var index = findIndex($scope.newPermission.objects, function (obj) {
            return obj.id === child.id;
          });

          if (index !== -1) $scope.newPermission.objects.splice(index, 1);
        });

        $scope.newPermission.objects.splice(objectIndex, 1);
      } else {
        $scope.newPermission.objects.push(object);
      }
    };

    $scope.selectAllObjects = function (objects) {
      for (var i = objects.length - 1; i >= 0; i--) {

        var x = false;

        for (var j = 0 ; j < $scope.newPermission.objects.length; j++) {
          if ($scope.newPermission.objects[j].id == objects[i].id) {
            x = true;
          }
        }

        if (!x) {
          $scope.newPermission.objects.push(objects[i]);
        }

        if (!_.isUndefined(objects[i].subcategories)) {
          $scope.selectAllObjects(objects[i].subcategories);
        }
      }
    };

    // We need to hide all permissions that a
    $scope.isObjectNeeded = function () {
      if ($scope.newPermission.slugs.length === 0) {
        return null;
      }

      for (var i = $scope.newPermission.slugs.length - 1; i >= 0; i--) {
        if (getPermission($scope.newPermission.type, $scope.newPermission.slugs[i]).needsObject) {
          return true;
        }
      }

      return false;
    };

    $scope.isPermissionDisabled = function (slug) {
      for (var i = $scope.newPermission.slugs.length - 1; i >= 0; i--) {
        if (getPermission($scope.newPermission.type, $scope.newPermission.slugs[i]).needsPermission === slug) {
          return true;
        }
      }

      // we disable fields that can't be selected while others are active
      for (var i = selectedSpecialFields.length - 1; i >= 0; i--) {
        if (selectedSpecialFields[i].disableFields.indexOf(slug) !== -1) return true;
      }

      return false;
    };

    $scope.getPermissionName = function (type, slug) {
      if (!type || !slug) {
        return false;
      }

      if (slug == 'users_edit') {
        return 'Gerenciar usuários de um grupo específico';
      }

      return getPermission(type, slug) ? getPermission(type, slug).name : slug;
    };

    $scope.setNewPermissionType = function (permissionType) {
      $timeout(function () {
        $scope.newPermission.objects = [];
        $scope.newPermission.slugs = [];
        selectedSpecialFields = [];

        $scope.showPermissionsMenu = false;
        $scope.showObjectsMenu = false;

        $scope.newPermission.type = permissionType ? permissionType.type : null;
      });
    };

    $scope.createPermission = function () {
      $scope.creatingPermission = true;

      var type = $scope.newPermission.actual_type || $scope.newPermission.type, slugs = $scope.newPermission.slugs;

      if ($scope.newPermission.objects.length !== 0) {
        var objectIds = [];

        for (var i = $scope.newPermission.objects.length - 1; i >= 0; i--) {
          objectIds.push($scope.newPermission.objects[i].id);
        }
      }

      var url = Restangular.one('permissions').one(isService ? 'services' : 'groups', $scope.resource.id).one(type);
      var postPermissionPromise = url.customPOST({ 'permissions': slugs, 'objects_ids': objectIds });

      postPermissionPromise.then(function (response) {
        $scope.creatingPermission = false;

        if ($scope.newPermission.objects.length === 0) {
          $scope.permissions.push({permission_type: type, permission_names: slugs, object: null});
        } else {
          for (var i = $scope.newPermission.objects.length - 1; i >= 0; i--) {
            var foundExisting = false;

            // if there is currently an existing permission for the same type and object, we can just add the slug to the list
            for (var j = $scope.permissions.length - 1; j >= 0; j--) {
              if (!_.isUndefined($scope.permissions[j].object) && $scope.permissions[j].permission_type == type && $scope.permissions[j].object.id == $scope.newPermission.objects[i].id) {
                foundExisting = true;

                $scope.permissions[j].permission_names = _.union($scope.permissions[j].permission_names, angular.copy(slugs));
              }
            }

            if (!foundExisting) {
              $scope.permissions.push({
                permission_type: type,
                permission_names: angular.copy(slugs),
                object: $scope.newPermission.objects[i]
              });
            }
          }
        }

        $scope.setNewPermissionType(null);
      });
    };

    $scope.removePermission = function (permissionObj, slug) {
      permissionObj.removingPermission = true;

      var objectId = permissionObj.object ? permissionObj.object.id : undefined;

      var deletePermissionPromise = Restangular.one('permissions')
        .one(isService ? 'services' : 'groups', $scope.resource.id)
        .one(permissionObj.permission_type).customDELETE(null, { permission: slug, object_id: objectId });

      deletePermissionPromise.then(function () {
        if (typeof permissionObj.permission_names === 'string' || (typeof permissionObj.permission_names === 'object' && permissionObj.permission_names.length === 1)) {
          $scope.permissions.splice($scope.permissions.indexOf(permissionObj), 1);
        } else {
          permissionObj.permission_names.splice(permissionObj.permission_names.indexOf(slug), 1);
        }

        permissionObj.removingPermission = false;
      });
    };

    $scope.removeCollectionPermissions = function(permissionsCollection) {
      $.each(permissionsCollection, function(i, permission) {
        if(typeof permission.permission_names === 'string') {
          $scope.removePermission(permission, permission.permission_names);
        } else {
          $.each(permission.permission_names, function(key, name) {
            $scope.removePermission(permission, name);
          });
        }
      });
    }

    var findIndex = function (collection, predicate) {
      var index = -1;

      _.each(collection, function (obj, i) {
        if (predicate(obj)) {
          index = i;
          return;
        }
      });

      return index;
    };
  });

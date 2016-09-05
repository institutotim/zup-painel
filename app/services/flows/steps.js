'use strict';

/**
 * Provides an API client for the flows's steps on the ZUP API
 * @module StepsService
 */
angular
  .module('StepsServiceModule', [])
  .factory('StepsService', function ($q, Restangular) {
    var self = {};

    /**
     * Fetches a single step
     * @param {Integer} step_id - The step ID
     * @param {Integer} flow_id - Flow's id
     * @param {Integer} version_id - Flow's version
     *
     * @returns {Object} Promise that returns the Step object when successful
     */
    self.fetch = function (flow_id, step_id, version_id) {
      return getVersionedFlowObject(Restangular.one('flows', flow_id).one('steps', step_id), version_id,
        {display_type: 'full'});
    };

    /**
     * Fetches a single step's fields
     * @param {Integer} step_id - The step ID
     * @param {Integer} flow_id - Flow's id
     * @param {Integer} version_id - Flow's version
     *
     * @returns {Object} Promise that returns an array of Fields for a given Step when successful
     */
    self.fetchFields = function (flow_id, step_id, version_id, options) {
      return getVersionedFlowObject(Restangular.one('flows', flow_id).one('steps', step_id).all('fields'),
        version_id || null, options);
    };

    /**
     * Fetches a single step's triggers
     * @param {Integer} step_id - The step ID
     * @param {Integer} flow_id - Flow's id
     * @param {Integer} version_id - Flow's version
     *
     * @returns {Object} Promise that returns an array of Triggers for a given Step when successful
     */
    self.fetchTriggers = function (flow_id, step_id, version_id) {
      return getVersionedFlowObject(Restangular.one('flows', flow_id)
        .one('steps', step_id).all('triggers'), version_id || null);
    };

    /**
     * Destroy a trigger
     * @param {Integer} flow_id
     * @param {Integer} step_id
     * @param {Integer} trigger_id
     */
    self.destroyTrigger = function (flow_id, step_id, trigger_id) {
      return Restangular
        .one('flows', flow_id)
        .one('steps', step_id)
        .one('triggers', trigger_id)
        .withHttpConfig({treatingErrors: true})
        .remove()
        .then(function(response) {
          return response.data.message;
        });
    };

    /**
     * Destroy a condition
     * @param {Integer} flow_id
     * @param {Integer} step_id
     * @param {Integer} trigger_id
     * @param {Integer} condition_id
     */
    self.destroyCondition = function (flow_id, step_id, trigger_id, condition_id) {
      return Restangular
        .one('flows', flow_id)
        .one('steps', step_id)
        .one('triggers', trigger_id)
        .one('trigger_conditions', condition_id)
        .withHttpConfig({treatingErrors: true})
        .remove()
        .then(function(response) {
          return response.data.message;
        });
    };

    /**
     * Replaces a given permission
     * @param {Integer} flow_id
     * @param {Integer} step_id
     * @param {String} type - The permission type, either 'can_execute_step' or 'can_view_step'
     * @param {Array} groups - The array of group IDs that will have this permission
     *
     * @returns {Object} Promise that indicates whether or not the update was successful
     */
    self.updatePermission = function (flow_id, step_id, type, groups) {
      return Restangular.one('flows', flow_id).one('steps', step_id).one('permissions').customPUT({
        permission_type: type,
        group_ids: _.map(groups, function (g) {
          return g.id;
        })
      });
    };

    /**
     * Update step fields
     * @param {Integer} flow_id
     * @param {Integer} step_id
     * @param {Object} fields - The KV of the fields that should change
     *
     * @returns {Object} Promise that indicates whether or not the update was successful
     */
    self.update = function (flow_id, step_id, fields) {
      return Restangular.one('flows', flow_id).one('steps', step_id).customPUT(fields);
    };

    // Handles flow version logic when doing an API request
    function getVersionedFlowObject(promise, version_id, options) {
      var deferred = $q.defer();
      options = options || {};

      if (_.isUndefined(version_id)) {
        options.draft = true;
      }
      else {
        options.version = version_id;
      }

      promise.customGET(null, options).then(function (response) {
        var step = denormalizeStep(Restangular.stripRestangular(response.data));
        deferred.resolve(step);
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    /**
     * Handles properties changes to facilitate its use on the client-side
     * @param field
     * @returns {*}
     */
    self.fieldDenormalizer = function (field) {
      var fields_without_size_reqs = ['previous_field', 'report_item', 'inventory_item', 'inventory_field'];

      if (_.isNull(field.requirements)) {
        field.requirements = {presence: 'false', multiline: 'false'};
        return field;
      }
      field.requirements.presence = field.requirements.presence || 'false';
      field.requirements.multiline = field.requirements.multiline || 'false';
      if (field.requirements.minimum) {
        field.requirements.minimum = parseInt(field.requirements.minimum, 10);
      }
      if (field.requirements.maximum) {
        field.requirements.maximum = parseInt(field.requirements.maximum, 10);
      }
      if (!_.include(fields_without_size_reqs, field.field_type)) {
        field.has_size_requirements = true;
      }
      if (field.category_report && field.category_report.length > 0) {
        field.values = _.map(field.category_report, function (cr) {
          return cr.id;
        })
      }
      if (field.category_inventory && field.category_inventory.length > 0) {
        field.values = _.map(field.category_inventory, function (ci) {
          return ci.id;
        })
      }
      return field;
    };

    /**
     * Denormalize data from the API to client-side usage
     */
    function denormalizeStep(step) {
      step.fields = _.map(step.fields, self.fieldDenormalizer);
      step.my_fields = _.map(step.my_fields, self.fieldDenormalizer);

      return step;
    }

    /**
     * Returns a friendly label based on the field type to be used on newly added fields to the step's form
     * @param fieldType String the field type
     * @returns String
     */
    self.getDefaultFieldLabel = function (fieldType) {
      var available_fields = self.getAvailableFields(), label, type;
      if (type = _.findWhere(available_fields['normal'], {kind: fieldType})) {
        label = type['name'];
      } else {
        label = _.findWhere(available_fields['special'], {kind: fieldType})['name'];
      }

      label = 'Novo ' + label[0].toLocaleLowerCase() + label.slice(1);
      return label;
    };

    /**
     * The list of fields available for use on a step
     * @returns {{normal: *[], special: *[]}}
     */
    self.getAvailableFields = function () {
      return {
        'normal': [
          {kind: 'text', name: 'Campo de texto'},
          {kind: 'integer', name: 'Campo numérico'},
          {kind: 'decimal', name: 'Campo decimal'},
          {kind: 'checkbox', name: 'Campo de múltipla escolha', multipleOptions: true},
          {kind: 'select', name: 'Campo de lista', multipleOptions: true},
          {kind: 'radio', name: 'Campo de escolha única', multipleOptions: true},
          {kind: 'meter', name: 'Campo em metros'},
          {kind: 'centimeter', name: 'Campo em centímetros'},
          {kind: 'kilometer', name: 'Campo em quilômetros'},
          {kind: 'year', name: 'Campo em anos'},
          {kind: 'month', name: 'Campo em meses'},
          {kind: 'day', name: 'Campo em dias'},
          {kind: 'hour', name: 'Campo em horas'},
          {kind: 'minute', name: 'Campo em minutos'},
          {kind: 'second', name: 'Campo em segundos'},
          {kind: 'angle', name: 'Campo de ângulo'},
          {kind: 'date', name: 'Campo de data'},
          {kind: 'time', name: 'Campo de tempo'},
          {kind: 'cpf', name: 'Campo de CPF'},
          {kind: 'cnpj', name: 'Campo de CNPJ'},
          {kind: 'url', name: 'Campo de URL'},
          {kind: 'email', name: 'Campo de e-mail'},
          {kind: 'image', name: 'Campo de imagem'},
          {kind: 'attachment', name: 'Campo de anexo'}
        ],

        'special': [
          {kind: 'previous_field', name: 'Campo de uma etapa anterior'},
          {kind: 'report_item', name: 'Seletor de relato'},
          {kind: 'inventory_item', name: 'Seletor de item de inventário'},
          {kind: 'inventory_field', name: 'Campo de um item de inventário'}
        ]
      };
    };

    return self;
  });

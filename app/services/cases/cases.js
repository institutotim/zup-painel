'use strict';

/**
 * Provides an API client for the cases on the ZUP API
 * @module CasesService
 */
angular
  .module('CasesServiceModule', [])
  .factory('CasesService', function ($q, FullResponseRestangular, ReturnFieldsService) {
    var self = {};

    /**
     * Fetches all cases
     * @param {Array} options - extra options for the endpoint
     *
     * @returns {Array} cases - Fetched cases
     */
    self.fetchAll = function (options) {
      var defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = ReturnFieldsService.convertToString([
        "id", "initial_flow_id", "created_at", "updated_at", "next_step_id", "total_steps", "status", "steps_not_fulfilled",
        {
          "get_responsible_user": [
            "id", "name"
          ],
          "get_responsible_group": [
            "id", "name"
          ],
          "resolution_state": [
            "title", "id"
          ]
        }
      ]);

      options = angular.extend(defaults, options || {});

      var promise = FullResponseRestangular.all('cases').customGET(null, options);

      return promise.then(function (response) {
        return {
          cases: response.data.cases,
          headers: response.headers
        };
      });
    };

    /**
     * Single Case API
     **/
    var CASE_STATUS = {
      active: 'Ativo',
      pending: 'Em andamento',
      finished: 'Finalizado',
      inactive: 'Inativo',
      transfer: 'Transferido',
      not_satisfied: 'Não finalizado'
    };

    var denormalizeCase = self.denormalizeCase = function (kase) {
      var denormalizedCase = {
        id: kase.id,
        status: CASE_STATUS[kase.status],
        flow: kase.initial_flow,
        created_at: kase.created_at,
        updated_at: kase.updated_at,
        current_step: kase.current_step ? denormalizeCaseStep(kase.current_step) : null,
        related_entities: kase.related_entities
      };

      if (kase.next_steps) {
        denormalizedCase = _.extend(denormalizedCase, {
          next_steps: _.map(kase.next_steps, function (flow_step) {
            return denormalizeCaseStep({ id: null, my_step: flow_step });
          }),
          next_steps_ids: _.map(kase.next_steps, function (step) {
            return step.id;
          })
        })
      }

      if (kase.previous_steps) {
        denormalizedCase = _.extend(denormalizedCase, {
          previous_steps: _.map(
            _.select(kase.case_steps, function (step) {
              return step.id !== kase.current_step.id;
            }), denormalizeCaseStep
          )
        });
      }

      if (kase.current_step || kase.previous_steps || kase.next_steps) {
        denormalizedCase = resolvePreviousFieldsValues(denormalizedCase);
      }

      return denormalizedCase;
    };

    var resolvePreviousFieldsValues = function(kase){
      var allSteps = _.flatten(_.compact([kase.current_step, kase.previous_steps, kase.next_steps]));

      var allFields = _.flatten(_.map(allSteps, function (step) {
        return step.my_step.my_fields;
      }));

      var previousFields =  _.select(allFields, function (field) {
        return field.type == 'previous_field';
      });

      _.each(previousFields, function(previousField){
        var previous_field_step = _.findWhere(allSteps, { step_id: previousField.previous_field_step_id });

        if (previous_field_step !== undefined) {
          previousField.previous_field = self.denormalizeCaseStepField(previousField.previous_field, previous_field_step);
        }
      });

      return kase;
    };

    var denormalizeCaseStep = function (step) {
      return _.extend(step, {
        flow_step: _.extend(step.my_step, {
          fields: _.map(step.my_step.fields_id, function (field_id) {
            return self.denormalizeCaseStepField(
              _.findWhere(step.my_step.my_fields, {id: parseInt(field_id, 10)}),
              step);
          })
        }),
        conductor: (step.responsible_user || step.responsible_group)
      });
    };

    var getDataForField = function(field, fields_data) {
      return _.select(fields_data, function (data) {
        return data.field.id == field.id;
      })[0] || {};
    };

    var isNumericField = function(field){
      return _.include([
        'meter', 'centimeter', 'kilometer',
        'year', 'month', 'day',
        'hour', 'hours', 'minute', 'second',
        'angle', 'decimal', 'integer'
      ], field.field_type);
    };

    var getValueForField = function (field, fields_data) {
      var data = getDataForField(field, fields_data);

      switch (field.field_type) {
        case 'image':
          if (data) {
            return data.case_step_data_images;
          } else {
            return [];
          }
        case 'attachment':
          if (data) {
            return data.case_step_data_attachments;
          } else {
            return [];
          }
        case 'inventory_item':
          return getInventoryItemsForField(field, fields_data);
        case 'select':
          if (data) {
            return _.findWhere(field.values, {value: data.value});
          }
          break;
        case 'checkbox':
          if (data) {
            return _.map(field.values, function (option) {
              return _.include(data.value, option.value);
            });
          }
          break;
        default:
          if (data) {
            if (isNumericField(field)) {
              return parseInt(data.value, 10);
            } else {
              return data.value;
            }
          }
          break;
      }
    };

    var getReportItemsForField = function(field, fields_data) {
      return getDataForField(field, fields_data).report_items;
    };

    var getInventoryItemsForField = function(field, fields_data) {
      return getDataForField(field, fields_data).inventory_items;
    };

    self.denormalizeInventoryFieldValue = function(field, value) {
      switch(field.type) {
        case 'select':
          if (value) {
            return _.findWhere(field.values, { value: value[0] });
          }
          break;
        case 'radio':
          if(value) {
            return value[0];
          }
          break;
        default:
          return value;
      }
    };

    self.denormalizeInventoryField = function(case_field, field){
      return {
        type: field.kind,
        values: _.map(_.reject(field.field_options, function(option){
          return option.disabled;
        }), function(option){
          return { value: option.id, label: option.value }
        })
      }
    };
    // ------ INVENTORY FIELD USAGE IN CASES

    self.denormalizeCaseStepField = function (field, step) {
      field.values = field.values ? _.map(field.values, function(value){
        return { value: value, label: value }
      }) : null;

      return _.extend(field, {
        requirements: _.extend(field.requirements, {
          presence: field.requirements && field.requirements.presence == 'true',
          multiline: field.requirements && field.requirements.multiline == 'true'
        }),
        type: field.field_type,
        inventory_field: field.category_inventory_field ? self.denormalizeInventoryField(field, field.category_inventory_field) : undefined,
        value: step.case_step_data_fields && step.case_step_data_fields.length > 0 ? getValueForField(field, step.case_step_data_fields) : undefined,
        report_items: getReportItemsForField(field, step.case_step_data_fields),
        inventory_items: getInventoryItemsForField(field, step.case_step_data_fields),
        previous_field: field.previous_field
      });
    };

    var FIELD_RETURN_FIELDS = [
      "id", "title", "field_type", "filter", "origin_field_id", "origin_field_version",
      "category_inventory", "category_inventory_field", "category_report", "requirements",
      "multiple", "values", "active", "version_id", "updated_at", "created_at",
      "previous_field_step_id", "field_id", "previous_field"
    ];

    var STEP_RETURN_FIELDS = [
      "id", "active", "conduction_mode_open", "created_at", "fields_id",
      "flow_id", "step_type", "title", "updated_at", "version_id", "permissions",
      {
        "fields": FIELD_RETURN_FIELDS,
        "my_fields": FIELD_RETURN_FIELDS
      }
    ];

    var CASE_STEP_RETURN_FIELDS = [
      "id", "step_id", "created_at",
      {
        "created_by": ["id", "name"],
        "responsible_group": ["id", "name"],
        "responsible_user": ["id", "name"],
        "updated_by": ["id", "name"],
        "my_step": STEP_RETURN_FIELDS,
        "case_step_data_fields": [
          "id", "value", "case_step_data_images", "case_step_data_images", "case_step_data_attachments",
          "report_items", "inventory_items",
          {
            "field": FIELD_RETURN_FIELDS
          }
        ]
      }
    ];

    var CASE_RETURN_FIELDS = ReturnFieldsService.convertToString([
      "id", "status",
      {
        "case_steps": CASE_STEP_RETURN_FIELDS,
        "current_step": CASE_STEP_RETURN_FIELDS,
        "next_steps": STEP_RETURN_FIELDS,
        "previous_steps": CASE_STEP_RETURN_FIELDS,
        "responsible_user": ["id"],
        "get_responsible_user": ["name"],
        "initial_flow": ["id", "title", "my_resolution_states"],
        "related_entities": [{
          "report_items": ["id", "title", "custom_fields", {
            "category": ["id", "title", {
              "custom_fields": ["id", "title"]
            }]
          }]
        }]
      }
    ]);

    self.fetch = function (id) {
      var defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = CASE_RETURN_FIELDS;

      return FullResponseRestangular
        .one('cases', id)
        .withHttpConfig({treatingErrors: true})
        .customGET(null, defaults)
        .then(function (response) {
          return denormalizeCase(response.data.case);
        });
    };

    self.fetchHistory = function(caseId) {
      return FullResponseRestangular
        .one('cases', caseId)
        .all('history')
        .customGET(null, {
          display_type: 'full',
          return_fields: ReturnFieldsService.convertToString([
            "action", "created_at", "before_user", "before_group", "after_user", "after_group",
            {
              "user": [
                "id", "name"
              ],
              "step": [
                "id", "title"
              ]
            }
          ])
        });
    };

    self.saveStep = function (caseId, stepData) {
      var defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = CASE_RETURN_FIELDS;

      return FullResponseRestangular
        .one('cases', caseId)
        .customPUT(_.extend(defaults, stepData))
        .then(function (response) {
          return denormalizeCase(response.data.case);
        });
    };

    /**
     * Creates a new case
     * @param {Object} case - Case
     *
     * @returns {Object} case - Created case
     */
    self.create = function (kase) {
      var promise = FullResponseRestangular.all('cases').customPOST(_.extend({ return_fields: CASE_RETURN_FIELDS }, kase));

      return promise.then(function (response) {
        return {
          case: response.data.case,
          headers: response.headers
        }
      });
    };

    /**
     * Inactive a case
     * @param {Object} case - Case
     */
    self.inactive = function (kase) {
      var promise = FullResponseRestangular.one('cases', kase.id).remove();

      return promise.then(function (response) {
        return {
          message: response.data.message,
          headers: response.headers
        }
      });
    };

    /**
     * Restore a case
     * @param {Object} case - Case
     */
    self.restore = function (kase) {
      var promise = FullResponseRestangular.one('cases', kase.id).customPUT(null, 'restore');

      return promise.then(function (response) {
        return {
          message: response.data.message,
          headers: response.headers
        }
      });
    };

    /**
     * Finish a case
     * @param {Object} case - Case
     * @param {Object} resolution_state - ResolutionState
     */
    self.finish = function (kase, resolution_state) {
      var data = {
        resolution_state_id: resolution_state.id
      };

      return FullResponseRestangular
        .one('cases', kase.id)
        .customPUT(data, 'finish');
    };

    return self;
  });

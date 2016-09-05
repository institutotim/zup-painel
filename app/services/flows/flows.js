'use strict';

/**
 * Provides an API client for the flows on the ZUP API
 * @module FlowsService
 */
angular
  .module('FlowsServiceModule', [])
  .factory('FlowsService', function ($q, FullResponseRestangular, ReturnFieldsService) {
    var self = {};

    /**
     * Fetches all flows
     * @param {Array} options - extra options for the endpoint
     *
     * @returns {Array} flows - Fetched flows
     */
    self.fetchAll = function (options) {
      var defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = ReturnFieldsService.convertToString([
        "id", "title", "description", "initial", "total_cases",
        "created_at", "updated_at", "resolution_states",
        {
          "created_by": [
            "id", "name"
          ],
          "updated_by": [
            "id", "name"
          ],
          "steps": [
            "id"
          ]
        }
      ]);

      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .all('flows')
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          return response.data.flows;
        });
    };

    /**
     * Fetches a single flow
     * @param {Integer} id - Flow's id
     * @param {Integer} version - Flow's version
     * @param {Array} options - extra options for the endpoint
     *
     * @returns {Object} flow - Fetched flow
     */
    self.fetch = function (id, version, options) {
      var defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = ReturnFieldsService.convertToString([
        "id", "title", "resolution_states", "description", "initial", "version_id", "created_at", "draft", "steps_order",
        {
          "list_versions": [
            "version_id", "id", "updated_at"
          ],
          "my_steps": [
            "id", "title", "step_type",
            {
              "my_child_flow": [
                "id", "title", "step_type"
              ]
            }
          ]
        }
      ]);

      options = angular.extend(defaults, options || {});

      if (version) {
        options.version = version;
      }

      return FullResponseRestangular
        .one('flows', id)
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          var flow = response.data.flow;
          flow.my_steps = _.map(flow.steps_order, function (stepId) {
            return _.findWhere(flow.my_steps, {id: stepId});
          });
          return flow;
        });
    };

    /**
     * Returns a list of titles and IDs for the steps preceding the informed step in the same flow
     * @param flow_id Integer the flow id
     * @param step_id Integer the step id
     *
     * @returns {Array} a list of [<step ID>, <title>]
     */
    self.getPreviousStepList = function (flow_id, step_id) {
      var options = {
        display_type: 'full',
        return_fields: ReturnFieldsService.convertToString([
          "steps_order",
          {
            "steps": [
              "id", "title"
            ]
          }
        ])
      };

      return FullResponseRestangular
        .one('flows', flow_id)
        .customGET(null, options)
        .then(function (response) {
          var steps = response.data.flow.steps;
          var previous_steps_ids = response.data.flow.steps_order.slice(0, response.data.flow.steps_order.indexOf(step_id));
          return _.select(steps, function (step) {
            if (_.include(previous_steps_ids, step.id)) {
              return true;
            }
          });
        });
    };

    /**
     * Returns a list of titles and IDs for all inventory_item fields from the same flow
     * @param flow_id Integer the flow id
     *
     * @returns {Array} a list of [<step ID>, <title>]
     */
    self.getInventoryItemFields = function (flow_id) {
      var options = {
        display_type: 'full',
        inventory_field_contender: 'true',
        return_fields: ReturnFieldsService.convertToString([
          "id", "title",
          {
            "category_inventory": [
              {
                "sections": [
                  {
                    "fields": [
                      "id", "title", "label"
                    ]
                  }
                ]
              }
            ]
          }
        ])
      };

      return FullResponseRestangular
        .one('flows', flow_id)
        .all('fields')
        .customGET(null, options)
        .then(function (response) {
          return response.data.fields;
        });
    };

    /**
     * Create a new flow
     * @param {Object} flow - A new flow
     *
     * @returns {Object} flow - Created flow
     */
    self.create = function (flow) {
      return FullResponseRestangular
        .all('flows')
        .withHttpConfig({treatingErrors: true})
        .post(flow)
        .then(function (response) {
          return response.data.flow;
        });
    };

    /**
     * Update a flow
     * @param {Object} flow - The flow
     */
    self.update = function (flow) {
      return FullResponseRestangular
        .one('flows', flow.id)
        .withHttpConfig({treatingErrors: true})
        .customPUT(flow)
        .then(function (response) {
          return response.data;
        });
    };

    /**
     * Destroy a flow
     * @params {Integer} id - Flow's id
     */
    self.destroy = function (id) {
      return FullResponseRestangular
        .one('flows', id)
        .withHttpConfig({treatingErrors: true})
        .remove()
        .then(function (response) {
          return response.data.message;
        });
    };

    /**
     * Reorders the steps of a flow
     * @param {Integer} id - Flow's id
     * @param {Array} steps - List of steps reordered
     */
    self.reorder = function (id, steps) {
      var params = {
        ids: []
      };

      angular.forEach(steps, function (step) {
        params.ids.push(step.id);
      });

      return FullResponseRestangular
        .one('flows', id)
        .withHttpConfig({treatingErrors: true})
        .customPUT(params, 'steps');
    };

    /**
     * Publish a flow
     * @param {Integer} id - Flow's id
     */
    self.publish = function (id) {
      return FullResponseRestangular
        .one('flows', id)
        .withHttpConfig({treatingErrors: true})
        .customPOST(null, 'publish');
    };

    /**
     * Set a current version
     * @param {Integer} id - Flow's id
     * @param {Integer} version - Version's id
     */
    self.setVersion = function (id, version) {
      var params = {
        new_version: version
      };

      return FullResponseRestangular
        .one('flows', id)
        .withHttpConfig({treatingErrors: true})
        .customPUT(params, 'version');
    };

    return self;
  });

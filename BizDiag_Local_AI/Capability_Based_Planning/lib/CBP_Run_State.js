/**
 * Copyright © 2026 Ebrahim Pak
 *
 * SPDX-License-Identifier: CECILL-B
 *
 * This file is part of BizDiag.
 *
 * BizDiag is distributed under the CeCILL-B Free Software License Agreement,
 * Version 1.0. See the LICENSE file for details.
 *
 * The French and English versions of the license are available in
 * LICENSE-FR and LICENSE, respectively.
 *
 * Author: Ebrahim Pak
 *
 * @fileoverview Provides model queries, CBP's allowed element scope, and persisted two-stage run state.
 *
 * Move 1's capability-map scope contains Capability elements only. Courses of Action are discovered
 * separately as potential strategy inputs; Value Streams and Resources remain outside the Capability
 * Map and are never converted automatically into Capabilities.
 */
(function(root) {
    "use strict";

    const RUN_KEY = "CBP.Internal.RunRecord";
    const MODEL_ID_KEY = "CBP.Internal.ModelID";
    const OWNER = "BizDiag CBP Workflow v1";
    const SCOPE_TYPES = ["capability"];
    const STRATEGY_TYPES = ["course-of-action"];
    const RUN_ELEMENT_TYPES = SCOPE_TYPES.concat(STRATEGY_TYPES);

    /**
     * Gets an Archi object's display name through either jArchi or a test adapter.
     * @param {Object} object Model object.
     * @returns {string} Object name, or an empty string.
     */
    function nameOf(object) {
        return object && typeof object.getName === "function"
            ? String(object.getName() || "")
            : String((object && object.name) || "");
    }

    /**
     * Gets an Archi object's stable model identity.
     * @param {Object} object Model object.
     * @returns {string} Model ID, or an empty string.
     */
    function idOf(object) {
        if (!object) return "";
        const value = typeof object.getId === "function" ? object.getId() : object.id;
        return value === null || value === undefined ? "" : String(value);
    }

    /**
     * Gets the jArchi element type identifier.
     * @param {Object} object Model object.
     * @returns {string} Type identifier, or an empty string.
     */
    function typeOf(object) {
        if (!object) return "";
        const value = typeof object.getType === "function" ? object.getType() : object.type;
        return value === null || value === undefined ? "" : String(value);
    }

    /**
     * Reads a normalized CBP property via the shared input adapter.
     * @param {Object} object Archi model object.
     * @param {string} key Custom-property name.
     * @returns {string} Property value.
     */
    function property(object, key) {
        return root.cbpModelInputs.readProperty(object, key);
    }

    /**
     * Creates an empty custom-property entry only when it has no current value.
     * @param {Object} object Archi model object.
     * @param {string} key Custom-property name.
     */
    function setIfAbsent(object, key) {
        if (!property(object, key)) root.cbpModelInputs.writeProperty(object, key, "");
    }

    /**
     * Queries all model elements of a jArchi type.
     * @param {string} type jArchi query type.
     * @returns {Object[]} Matching model elements.
     */
    function query(type) {
        const found = [];
        $(type).each(function(item) { if (item) found.push(item); });
        return found;
    }

    /**
     * Removes duplicate or unidentified objects from a collection using Archi model IDs.
     * @param {Object[]} items Model objects.
     * @returns {Object[]} Unique identified objects, preserving first-seen order.
     */
    function uniqueById(items) {
        const seen = {};
        return items.filter(function(item) {
            const id = idOf(item);
            if (!id || seen[id]) return false;
            seen[id] = true;
            return true;
        });
    }

    /**
     * Reads selected model concepts when the jArchi selection API is available.
     * @returns {Object[]} Currently selected elements; an empty array when selection is unavailable.
     */
    function selectedConcepts() {
        const selected = [];
        if (typeof resolveSelection === "undefined" || !resolveSelection ||
            typeof resolveSelection.selectedConcepts !== "function") return selected;
        const collection = resolveSelection.selectedConcepts("element");
        if (collection && typeof collection.each === "function") {
            collection.each(function(item) { if (item) selected.push(item); });
        } else if (collection && typeof collection.size === "function") {
            for (let i = 0; i < collection.size(); i++) {
                const item = collection.get(i);
                if (item) selected.push(item);
            }
        }
        return selected;
    }

    /**
     * Tests whether an element is an existing, non-generated Capability.
     * @param {Object} element Candidate model element.
     * @returns {boolean} True for an eligible user/model-owned scope element.
     */
    function isSupportedScopeElement(element) {
        return SCOPE_TYPES.indexOf(typeOf(element)) >= 0 &&
            !property(element, "CBP.GeneratedKey");
    }

    /**
     * Discovers Move 1 scope from eligible selection, or from the active model if none is selected.
     *
     * The selected-scope behavior lets architects focus the Capability Map; a selection containing
     * no Capabilities falls back to all non-generated Capabilities in the model.
     * @returns {{scope:Object[], capabilities:Object[]}}
     */
    function discoverScope() {
        const selected = selectedConcepts().filter(isSupportedScopeElement);
        const candidates = selected.length ? selected : [].concat.apply([], SCOPE_TYPES.map(query))
            .filter(isSupportedScopeElement);
        const scope = uniqueById(candidates);
        return {
            scope: scope,
            capabilities: scope
        };
    }

    /**
     * Finds potential strategy elements for Move 1's input worklist.
     * Only Courses of Action are eligible, and none are assumed to be strategies until marked by
     * the user with {@code CBP.Role=Strategy}.
     * @returns {Object[]} Unique, non-generated Course of Action elements.
     */
    function discoverPotentialStrategies() {
        return uniqueById([].concat.apply([], STRATEGY_TYPES.map(query))
            .filter(function(item) {
                return !property(item, "CBP.GeneratedKey");
            }));
    }

    /**
     * Returns all model Capabilities except CBP-generated diagram-card concepts.
     * Used to preserve and validate unique short input codes across runs.
     * @returns {Object[]} Capability elements.
     */
    function allCapabilities() {
        return query("capability").filter(function(item) {
            return !property(item, "CBP.GeneratedKey");
        });
    }

    /**
     * Preserves existing short Capability codes and assigns unique codes to uncoded Capabilities.
     * The code makes each impact property understandable (for example, {@code CBP.Impact.CAP-001})
     * while keeping the assessed Capability identity stable across workflow runs.
     * @param {Object[]} capabilities In-scope Capabilities.
     * @returns {{id:string, code:string}[]} Capability IDs and their assigned/preserved codes.
     * @throws {Error} If an existing code is invalid or duplicated in the model.
     */
    function ensureInputCodes(capabilities) {
        const all = allCapabilities();
        const owners = {};
        all.forEach(function(capability) {
            const code = property(capability, "CBP.InputCode");
            if (!code) return;
            if (!/^[A-Za-z0-9_-]{1,24}$/.test(code)) {
                throw new Error("Capability '" + nameOf(capability) +
                    "' has invalid CBP.InputCode '" + code + "'. Use 1-24 letters, numbers, underscores, or hyphens.");
            }
            const normalized = code.toUpperCase();
            if (owners[normalized] && owners[normalized] !== idOf(capability)) {
                throw new Error("Duplicate CBP.InputCode '" + code + "' is assigned to multiple Capabilities.");
            }
            owners[normalized] = idOf(capability);
        });

        let next = 1;
        capabilities.forEach(function(capability) {
            if (property(capability, "CBP.InputCode")) return;
            let code = "";
            do {
                code = "CAP-" + String(next++).padStart(3, "0");
            } while (owners[code]);
            root.cbpModelInputs.writeProperty(capability, "CBP.InputCode", code);
            owners[code] = idOf(capability);
        });
        return capabilities.map(function(capability) {
            return {id: idOf(capability), code: property(capability, "CBP.InputCode")};
        });
    }

    /**
     * Resolves the active model identity, preferring its persisted CBP identity marker.
     * @param {Object} activeModel Active Archi model.
     * @returns {{id:string, name:string}} Stable model ID and readable name.
     * @throws {Error} If the model has no readable name.
     */
    function modelIdentity(activeModel) {
        const id = property(activeModel, MODEL_ID_KEY) || idOf(activeModel);
        const modelName = nameOf(activeModel);
        if (!modelName) throw new Error("The active Archi model has no readable identity.");
        return {id: id, name: modelName};
    }

    /**
     * Persists a unique CBP model identity when the active model does not already have one.
     * @param {Object} activeModel Active Archi model.
     * @returns {{id:string, name:string}} Persisted model ID and name.
     */
    function ensureModelIdentity(activeModel) {
        let id = property(activeModel, MODEL_ID_KEY);
        if (!id) {
            id = "cbp-model-" + Date.now().toString(36) + "-" +
                Math.floor(Math.random() * 0x1000000).toString(36);
            root.cbpModelInputs.writeProperty(activeModel, MODEL_ID_KEY, id);
        }
        return {id: id, name: nameOf(activeModel)};
    }

    /**
     * Reads and validates the model-local checkpoint used to connect Move 1 with Moves 2-7.
     * @param {Object} activeModel Active Archi model.
     * @returns {?Object} Parsed run record, or null when no run exists.
     * @throws {Error} If persisted run state is corrupt or uses an unsupported schema.
     */
    function readRun(activeModel) {
        const raw = property(activeModel, RUN_KEY);
        if (!raw) return null;
        let run;
        try {
            run = JSON.parse(raw);
        } catch (error) {
            throw new Error("The CBP run record is corrupt JSON. Do not start a new run until it is repaired.");
        }
        if (!run || run.schema !== 1 || typeof run.runId !== "string" ||
            typeof run.status !== "string" || !run.model) {
            throw new Error("The CBP run record has an unsupported or incomplete schema.");
        }
        return run;
    }

    /**
     * Persists the Move 1/continuation run record as model-local custom-property JSON.
     * @param {Object} activeModel Active Archi model.
     * @param {Object} run Workflow checkpoint.
     */
    function writeRun(activeModel, run) {
        root.cbpModelInputs.writeProperty(activeModel, RUN_KEY, JSON.stringify(run));
    }

    /**
     * Resolves a recorded scope ID among the only element types admitted by the CBP workflow.
     * @param {string} id Archi model ID recorded in the Move 1 checkpoint.
     * @returns {?Object} Matching Capability or Course of Action.
     */
    function findElement(id) {
        const types = RUN_ELEMENT_TYPES;
        for (let t = 0; t < types.length; t++) {
            const items = query(types[t]);
            for (let i = 0; i < items.length; i++) {
                if (idOf(items[i]) === String(id)) return items[i];
            }
        }
        return null;
    }

    root.cbpRunState = Object.freeze({
        OWNER: OWNER,
        RUN_KEY: RUN_KEY,
        SCOPE_TYPES: SCOPE_TYPES,
        STRATEGY_TYPES: STRATEGY_TYPES,
        nameOf: nameOf,
        idOf: idOf,
        typeOf: typeOf,
        property: property,
        setIfAbsent: setIfAbsent,
        query: query,
        uniqueById: uniqueById,
        discoverScope: discoverScope,
        discoverPotentialStrategies: discoverPotentialStrategies,
        allCapabilities: allCapabilities,
        ensureInputCodes: ensureInputCodes,
        modelIdentity: modelIdentity,
        ensureModelIdentity: ensureModelIdentity,
        readRun: readRun,
        writeRun: writeRun,
        findElement: findElement
    });
})(typeof globalThis !== "undefined" ? globalThis : this);

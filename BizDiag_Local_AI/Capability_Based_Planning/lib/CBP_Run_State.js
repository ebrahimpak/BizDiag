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
 * -------------------------------------------------------------------------------------------------------------------
 *
 * Archi/jArchi adapters for CBP scope discovery, model properties, and durable run state.
 */
(function(root) {
    "use strict";

    const RUN_KEY = "CBP.Internal.RunRecord";
    const MODEL_ID_KEY = "CBP.Internal.ModelID";
    const OWNER = "BizDiag CBP Workflow v1";
    const SOURCE_TYPES = ["business-function", "business-process", "business-service"];
    const STRATEGY_TYPES = ["driver", "goal", "requirement", "course-of-action"];
    const SCOPE_TYPES = ["capability"].concat(SOURCE_TYPES);

    function nameOf(object) {
        return object && typeof object.getName === "function"
            ? String(object.getName() || "")
            : String((object && object.name) || "");
    }

    function idOf(object) {
        if (!object) return "";
        const value = typeof object.getId === "function" ? object.getId() : object.id;
        return value === null || value === undefined ? "" : String(value);
    }

    function typeOf(object) {
        if (!object) return "";
        const value = typeof object.getType === "function" ? object.getType() : object.type;
        return value === null || value === undefined ? "" : String(value);
    }

    function property(object, key) {
        return root.cbpModelInputs.readProperty(object, key);
    }

    function setIfAbsent(object, key) {
        if (!property(object, key)) root.cbpModelInputs.writeProperty(object, key, "");
    }

    function query(type) {
        const found = [];
        $(type).each(function(item) { if (item) found.push(item); });
        return found;
    }

    function uniqueById(items) {
        const seen = {};
        return items.filter(function(item) {
            const id = idOf(item);
            if (!id || seen[id]) return false;
            seen[id] = true;
            return true;
        });
    }

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

    function isSupportedScopeElement(element) {
        return SCOPE_TYPES.indexOf(typeOf(element)) >= 0 &&
            !property(element, "CBP.GeneratedKey");
    }

    function discoverScope() {
        const selected = selectedConcepts().filter(isSupportedScopeElement);
        const candidates = selected.length ? selected : [].concat.apply([], SCOPE_TYPES.map(query))
            .filter(isSupportedScopeElement);
        const scope = uniqueById(candidates);
        const capabilities = scope.filter(function(item) { return typeOf(item) === "capability"; });
        const sources = scope.filter(function(item) {
            return SOURCE_TYPES.indexOf(typeOf(item)) >= 0 &&
                property(item, "CBP.Candidate.SourceID") === "";
        });
        return {scope: scope, capabilities: capabilities, sources: sources};
    }

    function discoverPotentialStrategies() {
        return uniqueById([].concat.apply([], STRATEGY_TYPES.map(query))
            .filter(function(item) {
                return !property(item, "CBP.GeneratedKey");
            }));
    }

    function allCapabilities() {
        return query("capability").filter(function(item) {
            return !property(item, "CBP.GeneratedKey");
        });
    }

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

    function modelIdentity(activeModel) {
        const id = property(activeModel, MODEL_ID_KEY) || idOf(activeModel);
        const modelName = nameOf(activeModel);
        if (!modelName) throw new Error("The active Archi model has no readable identity.");
        return {id: id, name: modelName};
    }

    function ensureModelIdentity(activeModel) {
        let id = property(activeModel, MODEL_ID_KEY);
        if (!id) {
            id = "cbp-model-" + Date.now().toString(36) + "-" +
                Math.floor(Math.random() * 0x1000000).toString(36);
            root.cbpModelInputs.writeProperty(activeModel, MODEL_ID_KEY, id);
        }
        return {id: id, name: nameOf(activeModel)};
    }

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

    function writeRun(activeModel, run) {
        root.cbpModelInputs.writeProperty(activeModel, RUN_KEY, JSON.stringify(run));
    }

    function findElement(id) {
        const types = ["capability"].concat(SOURCE_TYPES, STRATEGY_TYPES);
        for (let t = 0; t < types.length; t++) {
            const items = query(types[t]);
            for (let i = 0; i < items.length; i++) {
                if (idOf(items[i]) === String(id)) return items[i];
            }
        }
        return null;
    }

    function ensureCandidate(activeModel, source) {
        const sourceId = idOf(source);
        const existing = query("capability").filter(function(item) {
            return property(item, "CBP.Candidate.SourceID") === sourceId;
        });
        if (existing.length > 1) {
            throw new Error("Multiple candidate Capabilities reference source ID " + sourceId + ".");
        }
        if (existing.length === 1) {
            const candidate = existing[0];
            if (property(candidate, "CBP.CandidateStatus") !== "ReviewRequired") {
                root.cbpModelInputs.writeProperty(candidate, "CBP.CandidateStatus", "ReviewRequired");
            }
            return candidate;
        }
        const candidate = activeModel.createElement(
            "capability",
            "[CBP Candidate] " + nameOf(source) + " [" + typeOf(source) + "] [ID:" +
                sourceId.substring(0, 8) + "]"
        );
        candidate.documentation =
            "Provisional CBP Capability hypothesis derived from '" + nameOf(source) + "'. Review its meaning, " +
            "name, hierarchy, and profile before relying on its assessments.";
        root.cbpModelInputs.writeProperty(candidate, "CBP.GeneratedBy", OWNER);
        root.cbpModelInputs.writeProperty(candidate, "CBP.Candidate.SourceID", sourceId);
        root.cbpModelInputs.writeProperty(candidate, "CBP.Candidate.SourceType", typeOf(source));
        root.cbpModelInputs.writeProperty(candidate, "CBP.Candidate.SourceName", nameOf(source));
        root.cbpModelInputs.writeProperty(candidate, "CBP.CandidateStatus", "ReviewRequired");
        return candidate;
    }

    root.cbpRunState = Object.freeze({
        OWNER: OWNER,
        RUN_KEY: RUN_KEY,
        SOURCE_TYPES: SOURCE_TYPES,
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
        findElement: findElement,
        ensureCandidate: ensureCandidate
    });
})(typeof globalThis !== "undefined" ? globalThis : this);

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
 * @fileoverview Renders the Capability-only Move 1 map, input worklists, and analytical Moves 2-7 views.
 *
 * The view sequence mirrors the seven-move workflow described in "Capability-Based Planning,
 * The Link between Strategy and Enterprise Architecture" and "Capability-based Planning in 7 moves!".
 * It visualizes inputs and calculated results; it does not replace capability-map validation, strategy
 * selection, or the architect's interpretation of goals and actions.
 */
(function(root) {
    "use strict";

    const OWNER = root.cbpRunState.OWNER;
    const VIEW_MARKER = "CBP.ManagedBy";
    const VIEW_KEY = "CBP.ViewKey";
    const LEGACY_PROFILE_NAME = "CBP - Capability Map and Profiles";
    const NAMES = {
        capabilityMap: "CBP - Capability Map",
        profile: "CBP - Capability Profiles and Inputs",
        strategies: "CBP - Strategy Inputs",
        maturity: "CBP - Maturity and Strategic Importance - Maturity Heatmap",
        importance: "CBP - Maturity and Strategic Importance - Strategic Importance Heatmap",
        matrix: "CBP - ML-SI Matrix and Improvement Goals",
        portfolio: "CBP - Actions and Change Portfolio",
        overview: "Capability-based Planning View"
    };
    const KEYS_BY_NAME = {};
    KEYS_BY_NAME[NAMES.capabilityMap] = "move-1-capability-map";
    KEYS_BY_NAME[NAMES.profile] = "move-1-profile";
    KEYS_BY_NAME[LEGACY_PROFILE_NAME] = "move-1-profile";
    KEYS_BY_NAME[NAMES.strategies] = "move-1-strategy-inputs";
    KEYS_BY_NAME[NAMES.maturity] = "moves-2-maturity";
    KEYS_BY_NAME[NAMES.importance] = "moves-3-importance";
    KEYS_BY_NAME[NAMES.matrix] = "moves-4-5-matrix";
    KEYS_BY_NAME[NAMES.portfolio] = "moves-6-7-portfolio";
    KEYS_BY_NAME[NAMES.overview] = "workflow-overview";

    /**
     * Converts a jArchi collection to a JavaScript array.
     * @param {Object} collection Collection supporting jArchi's {@code each} method.
     * @returns {Object[]} Collection members.
     */
    function collectionToArray(collection) {
        const values = [];
        if (collection && typeof collection.each === "function") {
            collection.each(function(item) { values.push(item); });
        }
        return values;
    }

    /**
     * Gets a view's display name through the common run-state adapter.
     * @param {Object} view Archi diagram view.
     * @returns {string} View name.
     */
    function viewName(view) {
        return root.cbpRunState.nameOf(view);
    }

    /**
     * Reads a custom identity/ownership property from a view.
     * @param {Object} view Archi diagram view.
     * @param {string} key Custom-property name.
     * @returns {string} Normalized property value.
     */
    function viewProperty(view, key) {
        return root.cbpRunState.property(view, key);
    }

    /**
     * Produces a view label that identifies a Capability by its stable short input code.
     * @param {Object} element Archi model element.
     * @returns {string} Readable element name and code or a short ID fallback.
     */
    function elementLabel(element) {
        const code = root.cbpRunState.property(element, "CBP.InputCode");
        if (code) return root.cbpRunState.nameOf(element) + " [" + code + "]";
        const id = root.cbpRunState.idOf(element);
        return root.cbpRunState.nameOf(element) + " [ID:" + id.substring(0, 8) + "]";
    }

    /**
     * Formats legacy provisional-candidate provenance, if one is present on a Capability.
     * @param {Object} capability Archi Capability.
     * @returns {string} Candidate status/source note, or an empty string.
     */
    function candidateContext(capability) {
        const status = root.cbpRunState.property(capability, "CBP.CandidateStatus");
        if (!status) return "";
        return "\nCandidate status: " + status + " (assessment is provisional)." +
            "\nSource: " + root.cbpRunState.property(capability, "CBP.Candidate.SourceType") +
            " - " + root.cbpRunState.property(capability, "CBP.Candidate.SourceName");
    }

    /**
     * Enumerates model views, using the supported jArchi API or a diagram-model query fallback.
     * @param {Object} activeModel Active Archi model.
     * @returns {Object[]} Views belonging to or discoverable for the model.
     * @throws {Error} If no supported view enumeration route is available.
     */
    function allViews(activeModel) {
        if (!activeModel) {
            throw new Error("The active Archi model is unavailable while enumerating views.");
        }
        if (typeof activeModel.getViews === "function") {
            return collectionToArray(activeModel.getViews());
        }

        const found = [];
        const seen = {};
        let querySucceeded = false;
        /**
         * Adds query results once, deduplicating by model ID or fallback view name.
         * @param {Object} collection jArchi collection of diagram views.
         */
        function addFrom(collection) {
            collectionToArray(collection).forEach(function(view) {
                const id = root.cbpRunState.idOf(view);
                const key = id || viewName(view);
                if (!seen[key]) {
                    seen[key] = true;
                    found.push(view);
                }
            });
        }
        try {
            addFrom($("archimate-diagram-model"));
            querySucceeded = true;
        } catch (error) {
            console.log("[WARN] Could not query Archi diagram views globally: " + error.message);
        }
        try {
            const modelChildren = $(activeModel).children();
            if (modelChildren && typeof modelChildren.filter === "function") {
                addFrom(modelChildren.filter("archimate-diagram-model"));
                querySucceeded = true;
            } else {
                addFrom(modelChildren);
                if (modelChildren) querySucceeded = true;
            }
        } catch (error) {
            console.log("[WARN] Could not query Archi model view children: " + error.message);
        }
        if (found.length || querySucceeded) return found;
        throw new Error("This jArchi version exposes neither model.getViews() nor queryable " +
            "archimate-diagram-model views. CBP stopped before modifying views.");
    }

    /**
     * Finds a uniquely named view in the active model.
     * @param {Object} activeModel Active Archi model.
     * @param {string} name Exact view name.
     * @returns {?Object} Matching view, or null when absent.
     * @throws {Error} If duplicate views have the requested name.
     */
    function findView(activeModel, name) {
        const matches = allViews(activeModel).filter(function(view) { return viewName(view) === name; });
        if (matches.length > 1) throw new Error("Several views are named '" + name + "'.");
        return matches.length ? matches[0] : null;
    }

    /**
     * Validates managed-view ownership and identity before any view is rebuilt.
     * This prevents CBP output generation from silently overwriting user-owned views.
     * @param {Object} activeModel Active Archi model.
     * @param {string[]} names Expected managed view names.
     * @param {Object<string,string>} stableIds Previously recorded view IDs keyed by name.
     * @param {Object<string,string>} legacyNames Optional previous view names keyed by current name.
     * @returns {Object<string,?Object>} Existing managed views or null slots for views to create.
     * @throws {Error} On duplicate names, ownership-marker mismatches, or identity conflicts.
     */
    function preflightViews(activeModel, names, stableIds, legacyNames) {
        const views = allViews(activeModel);
        const plans = {};
        stableIds = stableIds || {};
        legacyNames = legacyNames || {};
        names.forEach(function(name) {
            const matches = views.filter(function(view) { return viewName(view) === name; });
            const expectedId = stableIds[name];
            const legacyName = legacyNames[name];
            const legacyMatches = legacyName
                ? views.filter(function(view) { return viewName(view) === legacyName; })
                : [];
            if (legacyMatches.length > 1 || (matches.length && legacyMatches.length)) {
                throw new Error("The current or legacy managed view for '" + name +
                    "' is ambiguous. Resolve duplicate views before running CBP.");
            }
            if (!matches.length && legacyMatches.length === 1) {
                const legacyView = legacyMatches[0];
                if (expectedId && root.cbpRunState.idOf(legacyView) &&
                    root.cbpRunState.idOf(legacyView) !== String(expectedId)) {
                    throw new Error("The legacy view for '" + name +
                        "' does not match the recorded view identity.");
                }
                if (viewProperty(legacyView, VIEW_MARKER) !== OWNER ||
                    viewProperty(legacyView, VIEW_KEY) !== KEYS_BY_NAME[legacyName]) {
                    throw new Error("The legacy view '" + legacyName +
                        "' is not a recognized CBP-managed view; it will not be renamed or overwritten.");
                }
                plans[name] = legacyView;
                return;
            }
            if (expectedId) {
                const recorded = views.filter(function(view) {
                    return root.cbpRunState.idOf(view) === String(expectedId);
                });
                if (recorded.length > 1) {
                    throw new Error("The recorded managed view identity for '" + name + "' is ambiguous.");
                }
                if (recorded.length === 1 && viewName(recorded[0]) !== name) {
                    throw new Error("The recorded managed view '" + name + "' was renamed. Restore its expected name " +
                        "before continuing; CBP will not create a replacement automatically.");
                }
            }
            if (matches.length > 1) {
                throw new Error("Several views are named '" + name + "'. Resolve the collision before continuing.");
            }
            if (matches.length === 1) {
                const view = matches[0];
                if (viewProperty(view, VIEW_MARKER) !== OWNER) {
                    throw new Error("A user-owned view is already named '" + name +
                        "'. Rename it before running CBP; it will not be overwritten.");
                }
                if (viewProperty(view, VIEW_KEY) !== KEYS_BY_NAME[name]) {
                    throw new Error("The managed view '" + name +
                        "' has a missing or unexpected CBP identity marker. Resolve it before running CBP.");
                }
                if (expectedId && root.cbpRunState.idOf(view) &&
                    root.cbpRunState.idOf(view) !== String(expectedId)) {
                    throw new Error("The view named '" + name + "' does not match the recorded view identity.");
                }
                plans[name] = view;
            } else {
                plans[name] = null;
            }
        });
        return plans;
    }

    /**
     * Creates or reuses a preflight-approved view and stamps its CBP ownership identity.
     * @param {Object} activeModel Active Archi model.
     * @param {string} name View name.
     * @param {string} key Stable internal view key.
     * @param {Object<string,?Object>} plans Preflight results.
     * @returns {Object} Managed Archi diagram view.
     */
    function obtainView(activeModel, name, key, plans) {
        let view = plans && plans[name];
        if (!view) {
            view = activeModel.createArchimateView(name);
            if (!view) throw new Error("Could not create the view '" + name + "'.");
        }
        if (viewName(view) !== name) view.name = name;
        root.cbpModelInputs.writeProperty(view, VIEW_MARKER, OWNER);
        root.cbpModelInputs.writeProperty(view, VIEW_KEY, key);
        return view;
    }

    /**
     * Removes existing visual children so a managed view can be rebuilt idempotently.
     * @param {Object} view Managed Archi view.
     */
    function clearView(view) {
        const children = [];
        $(view).children().each(function(child) { children.push(child); });
        children.forEach(function(child) {
            if (child && typeof child.delete === "function") child.delete();
        });
    }

    /**
     * Creates or updates a CBP-owned model concept identified by a stable generated key.
     * Name collisions with concepts not owned by CBP stop generation rather than overwrite user data.
     * @param {Object} activeModel Active Archi model.
     * @param {string} type ArchiMate concept type.
     * @param {string} key Stable CBP generation key.
     * @param {string} name Display name.
     * @param {string} documentation Concept documentation.
     * @returns {Object} Generated or reused concept.
     */
    function generatedConcept(activeModel, type, key, name, documentation) {
        const concepts = root.cbpRunState.query(type);
        const found = concepts.filter(function(element) {
            return root.cbpRunState.property(element, "CBP.GeneratedKey") === key;
        });
        if (found.length > 1) {
            throw new Error("Multiple generated model concepts have key '" + key + "'.");
        }
        let element = found.length ? found[0] : null;
        if (element && root.cbpRunState.typeOf(element) !== type) {
            throw new Error("Generated concept key '" + key + "' is owned by an unexpected element type.");
        }
        if (!element) {
            /**
             * Removes generated ID suffixes when checking readable-name collisions.
             * @param {string} value Candidate generated label.
             * @returns {string} Label without the optional ID suffix.
             */
            function normalizedLabel(value) {
                return value.replace(/ \[ID:[^\]]+\]/g, "");
            }
            const nameCollisions = concepts.filter(function(candidate) {
                return normalizedLabel(root.cbpRunState.nameOf(candidate)) === normalizedLabel(name) &&
                    !root.cbpRunState.property(candidate, "CBP.GeneratedKey");
            });
            if (nameCollisions.length) {
                throw new Error("A " + type + " named '" + name +
                    "' already exists without the expected CBP ownership key. Resolve the legacy/user concept " +
                    "collision before generating outputs.");
            }
            element = activeModel.createElement(type, name);
            root.cbpModelInputs.writeProperty(element, "CBP.GeneratedBy", OWNER);
            root.cbpModelInputs.writeProperty(element, "CBP.GeneratedKey", key);
        }
        element.name = name;
        element.documentation = documentation || "";
        return element;
    }

    /**
     * Adds one concept to a view at the supplied diagram coordinates.
     * @param {Object} view Archi diagram view.
     * @param {Object} concept Model concept to display.
     * @param {number} x Horizontal position.
     * @param {number} y Vertical position.
     * @param {number} width Object width.
     * @param {number} height Object height.
     * @returns {Object} Created diagram object.
     */
    function object(view, concept, x, y, width, height) {
        return view.add(concept, x, y, width, height);
    }

    /**
     * Adds a CBP-owned Business Object card with stable model identity to a view.
     * @param {Object} activeModel Active Archi model.
     * @param {Object} view Target view.
     * @param {string} key Stable CBP card key.
     * @param {string} name Card label.
     * @param {string} documentation Card content.
     * @param {number} x Horizontal position.
     * @param {number} y Vertical position.
     * @param {number} width Card width.
     * @param {number} height Card height.
     * @returns {Object} Diagram object and its underlying concept.
     */
    function card(activeModel, view, key, name, documentation, x, y, width, height) {
        const concept = generatedConcept(activeModel, "business-object", key, name, documentation);
        return object(view, concept, x, y, width, height);
    }

    /**
     * Builds a Capability-only map, a Capability profile/input worklist, and a Course of Action
     * strategy-input worklist. The map uses only existing Capability concepts and existing
     * Capability-to-Capability composition or aggregation relationships.
     * @param {Object} activeModel Active Archi model.
     * @param {Object[]} capabilities In-scope Capability assessment subjects.
     * @param {Object[]} potentialStrategies In-scope Course of Action elements.
     * @param {Object} run Pending workflow record, including configured increments.
     * @param {Object<string,?Object>} plans Preflight-approved Move 1 views.
     * @returns {{capabilityMap:Object, profile:Object, strategies:Object,
     *     capabilityRelationshipCount:number}} The map and two input views.
     */
    function drawSetup(activeModel, capabilities, potentialStrategies, run, plans) {
        let view = obtainView(activeModel, NAMES.capabilityMap, "move-1-capability-map", plans);
        const capabilityMapView = view;
        clearView(view);
        const capabilityIds = {};
        capabilities.forEach(function(capability) {
            capabilityIds[root.cbpRunState.idOf(capability)] = true;
        });
        const hierarchyRelationships = root.cbpRunState.query("relationship").filter(function(relationship) {
            const type = root.cbpRunState.typeOf(relationship);
            if (type !== "composition-relationship" && type !== "aggregation-relationship") return false;
            const source = relationship.getSource();
            const target = relationship.getTarget();
            return source && target && capabilityIds[root.cbpRunState.idOf(source)] &&
                capabilityIds[root.cbpRunState.idOf(target)];
        });
        const childrenByParent = {};
        const parentByChild = {};
        hierarchyRelationships.forEach(function(relationship) {
            const parentId = root.cbpRunState.idOf(relationship.getSource());
            const childId = root.cbpRunState.idOf(relationship.getTarget());
            if (!childrenByParent[parentId]) childrenByParent[parentId] = [];
            if (!parentByChild[childId]) parentByChild[childId] = [];
            childrenByParent[parentId].push(childId);
            parentByChild[childId].push(parentId);
        });
        Object.keys(childrenByParent).forEach(function(parentId) {
            childrenByParent[parentId].sort();
        });
        const levels = {};
        const orderedCapabilities = capabilities.slice().sort(function(left, right) {
            const leftName = root.cbpRunState.nameOf(left);
            const rightName = root.cbpRunState.nameOf(right);
            return leftName < rightName ? -1 : leftName > rightName ? 1 :
                root.cbpRunState.idOf(left).localeCompare(root.cbpRunState.idOf(right));
        });
        function assignLevels(startId) {
            const queue = [{id: startId, level: 0}];
            while (queue.length) {
                const item = queue.shift();
                if (levels[item.id] !== undefined) continue;
                levels[item.id] = item.level;
                (childrenByParent[item.id] || []).forEach(function(childId) {
                    if (levels[childId] === undefined) {
                        queue.push({id: childId, level: item.level + 1});
                    }
                });
            }
        }
        orderedCapabilities.filter(function(capability) {
            return !(parentByChild[root.cbpRunState.idOf(capability)] || []).length;
        }).forEach(function(capability) {
            assignLevels(root.cbpRunState.idOf(capability));
        });
        orderedCapabilities.forEach(function(capability) {
            const id = root.cbpRunState.idOf(capability);
            if (levels[id] === undefined) assignLevels(id);
        });
        const columns = {};
        orderedCapabilities.forEach(function(capability) {
            const id = root.cbpRunState.idOf(capability);
            const level = levels[id];
            if (!columns[level]) columns[level] = [];
            columns[level].push(capability);
        });
        const mapObjects = {};
        Object.keys(columns).forEach(function(level) {
            columns[level].forEach(function(capability, index) {
                mapObjects[root.cbpRunState.idOf(capability)] = object(
                    capabilityMapView, capability, 50 + Number(level) * 260, 50 + index * 100, 220, 70
                );
            });
        });
        hierarchyRelationships.forEach(function(relationship) {
            const sourceObject = mapObjects[root.cbpRunState.idOf(relationship.getSource())];
            const targetObject = mapObjects[root.cbpRunState.idOf(relationship.getTarget())];
            capabilityMapView.add(relationship, sourceObject, targetObject);
        });
        capabilityMapView.documentation =
            "Capability-only map. Contains the in-scope Capability elements and only their existing direct " +
            "Composition/Aggregation relationships to other in-scope Capabilities. The view does not contain " +
            "Value Streams, Resources, Courses of Action, generated Capability candidates, or inferred relationships." +
            (hierarchyRelationships.length
                ? ""
                : " No Capability hierarchy is modeled in the current scope; model decomposition using explicit " +
                    "Capability-to-Capability Composition or Aggregation relationships.");

        view = obtainView(activeModel, NAMES.profile, "move-1-profile", plans);
        const profileView = view;
        view.documentation =
            "Move 1 Capability profile and input worklist. The separate Capability Map view contains only Capability " +
            "elements and their explicitly modeled hierarchy. Enter maturity and per-year target/action properties " +
            "on each Capability in its Properties panel.";
        clearView(view);
        card(activeModel, view, "instructions:profile", "[CBP] Move 1 - Capability inputs",
            "Enter these Properties on each Capability:\nCBP.Maturity.People (0-4)\nCBP.Maturity.Process (0-4)\n" +
            "CBP.Maturity.Technology (0-4)\n\nFor every configured year: CBP.TargetML.<YYYY> and " +
            "CBP.Target.<Dimension>.<YYYY>. For each improvement: CBP.Action.<Dimension>.<YYYY>, " +
            "CBP.Project.<Dimension>.<YYYY>, and CBP.ProjectPriority.<Dimension>.<YYYY> (positive integer; " +
            "lower values rank first).\n" +
            "Do not enter the angle-bracket placeholders literally. Optional CBP.Weight.<Dimension> defaults to 1.",
            40, 35, 900, 120);
        capabilities.forEach(function(capability, index) {
            const candidateStatus = root.cbpRunState.property(capability, "CBP.CandidateStatus");
            const source = root.cbpRunState.property(capability, "CBP.Candidate.SourceType") +
                " - " + root.cbpRunState.property(capability, "CBP.Candidate.SourceName");
            const exactKeys = ["CBP.Maturity.People", "CBP.Maturity.Process", "CBP.Maturity.Technology"];
            run.increments.forEach(function(year) {
                exactKeys.push("CBP.TargetML." + year);
                root.cbpModelInputs.DIMENSIONS.forEach(function(dimension) {
                    exactKeys.push("CBP.Target." + dimension + "." + year);
                    exactKeys.push("CBP.Action." + dimension + "." + year);
                    exactKeys.push("CBP.Project." + dimension + "." + year);
                    exactKeys.push("CBP.ProjectPriority." + dimension + "." + year);
                });
            });
            const profileText = [
                ["Definition", "CBP.Profile.Definition"],
                ["Source", "CBP.Profile.Source"],
                ["Business units", "CBP.Profile.BusinessUnits"],
                ["Processes", "CBP.Profile.Processes"],
                ["Applications", "CBP.Profile.Applications"],
                ["Measures", "CBP.Profile.Measures"]
            ].map(function(field) {
                return field[0] + ": " + (root.cbpRunState.property(capability, field[1]) || "MISSING");
            }).join("\n");
            const cardText = (candidateStatus
                ? "Existing provisional candidate status: " + candidateStatus + "\nSource: " + source + "\n"
                : "") +
                "\nProfile:\n" + profileText +
                "\nRequired exact property names (add manually if Archi does not retain blank keys):\n" +
                exactKeys.join("\n") + "\nOptional weights: CBP.Weight.People, CBP.Weight.Process, " +
                "CBP.Weight.Technology (positive; absent means 1).";
            const y = 190 + index * 100;
            const conceptObject = object(view, capability, 50, y, 270, 70);
            const info = card(activeModel, view, "capability-input:" + capability.id,
                "[CBP] Inputs - " + elementLabel(capability), cardText,
                360, y, 600, 70);
            const association = ensureRelationship(
                activeModel, "association-relationship", "Capability input checklist",
                info.concept, capability
            );
            view.add(association, info, conceptObject);
        });
        view = obtainView(activeModel, NAMES.strategies, "move-1-strategy-inputs", plans);
        view.documentation =
            "Course of Action worklist. Set CBP.Role=Strategy only on intended Course of Action elements. " +
            "Then enter CBP.Impact.<CapabilityCode> (integer 0-2) for every in-scope Capability. " +
            "Strategy weights are optional and default to 1.";
        clearView(view);
        card(activeModel, view, "instructions:strategies", "[CBP] Move 1 - Strategy inputs",
            "These properties belong on the Course of Action shown beside each checklist. Set CBP.Role to the exact " +
            "text Strategy only for intended strategies. For each listed Capability, enter how strongly it contributes " +
            "to this strategy: 0 = no contribution, 1 = some contribution, 2 = strong contribution. " +
            "The short code in each property key identifies the Capability, not the strategy.",
            40, 35, 900, 100);
        potentialStrategies.forEach(function(strategy, index) {
            const y = 160 + index * 95;
            const role = root.cbpRunState.property(strategy, "CBP.Role");
            const keys = ["On THIS strategy element's Properties:", "CBP.Role = Strategy"].concat(
                capabilities.map(function(capability) {
                return root.cbpModelInputs.impactKey(capability) + " = (0, 1, or 2)  ->  " +
                        elementLabel(capability);
            })).join("\n");
            const sourceInfo = [];
            root.cbpRunState.query("relationship").forEach(function(relationship) {
                const source = relationship.getSource();
                const target = relationship.getTarget();
                if (!source || !target) return;
                let related = null;
                if (root.cbpRunState.idOf(target) === root.cbpRunState.idOf(strategy)) related = source;
                else if (root.cbpRunState.idOf(source) === root.cbpRunState.idOf(strategy)) related = target;
                if (related && sourceInfo.length < 8) {
                    sourceInfo.push(root.cbpRunState.typeOf(related) + ": " +
                        root.cbpRunState.nameOf(related));
                }
            });
            const elementObject = object(view, strategy, 50, y, 300, 65);
            const info = card(activeModel, view, "strategy-input:" + strategy.id,
                "[CBP] Strategy fields - " + elementLabel(strategy),
                "Type: " + root.cbpRunState.typeOf(strategy) + "\nCBP.Role: " + (role || "(unset)") +
                "\nRelated source/context: " + (sourceInfo.join("; ") || "none modeled") +
                "\n" + keys + "\nOptional: CBP.StrategyWeight (positive; default 1).",
                390, y, 650, 80);
            const association = ensureRelationship(
                activeModel, "association-relationship", "Strategy input checklist",
                info.concept, strategy
            );
            view.add(association, info, elementObject);
        });
        return {
            capabilityMap: capabilityMapView,
            profile: profileView,
            strategies: view,
            capabilityRelationshipCount: hierarchyRelationships.length
        };
    }

    /**
     * Renders one assessed CBP dimension as a five-band heatmap and shows unresolved inputs.
     * Corresponds to Move 2 maturity or Move 3 strategic-importance assessment.
     * @param {Object} activeModel Active Archi model.
     * @param {string} name Managed view name.
     * @param {string} key Stable internal view key.
     * @param {string} measure "Maturity" or "Strategic importance".
     * @param {Object[]} results Assessment engine results.
     * @param {Object<string,?Object>} plans Preflight-approved view references.
     * @returns {Object} Generated heatmap view.
     */
    function drawHeatmap(activeModel, name, key, measure, results, plans) {
        const view = obtainView(activeModel, name, key, plans);
        view.documentation = measure + " assessment from explicit CBP model inputs. Exact results are shown in cards; " +
            "unresolved inputs are listed, never imputed.";
        clearView(view);
        const colors = measure === "Maturity"
            ? ["#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#B6D7A8"]
            : ["#B6D7A8", "#D9EAD3", "#FFF2CC", "#FCE5CD", "#F4CCCC"];
        // ===== MOVES 2-3 RENDERING: Render the calculated scores in five bands with unresolved inputs visible. =====
        for (let score = 0; score <= 4; score++) {
            const legend = card(activeModel, view, "legend:" + key + ":" + score,
                "[CBP] " + measure + " band " + score, measure + " score " + score + " of 4.",
                40 + score * 220, 35, 200, 55);
            if (legend && legend.setFillColor) legend.setFillColor(colors[score]);
        }
        const counts = [0, 0, 0, 0, 0];
        let unresolvedCount = 0;
        results.forEach(function(result) {
            const score = measure === "Maturity" ? result.maturity : result.importance;
            const errors = measure === "Maturity"
                ? result.errors.filter(function(error) { return error.indexOf("CBP.Maturity.") === 0 ||
                    error.indexOf("CBP.Weight.") === 0; })
                : result.errors.filter(function(error) { return error.indexOf("CBP.Impact.") >= 0 ||
                    error.indexOf("No strategy") === 0; });
            const band = score === null ? 5 : Math.max(0, Math.min(4, Math.round(score)));
            const row = score === null ? unresolvedCount++ : counts[band]++;
            const x = score === null ? 40 : 40 + band * 220;
            const y = 115 + row * 95;
            const detail = (score === null
                ? "INPUT REQUIRED\n" + (errors.join("\n") || "Assessment unavailable.")
                : measure + ": " + score.toFixed(2) + "/4") + candidateContext(result.capability);
            const cardObject = card(activeModel, view, "score:" + key + ":" + result.capability.id,
                "[CBP] " + measure + " - " + elementLabel(result.capability),
                detail, x, y, 200, 65);
            if (score !== null && cardObject && cardObject.setFillColor) cardObject.setFillColor(colors[band]);
            const capabilityObject = object(view, result.capability, x, y + 67, 200, 50);
            const association = ensureRelationship(
                activeModel, "association-relationship", measure + " assessment for capability",
                cardObject.concept, result.capability
            );
            view.add(association, cardObject, capabilityObject);
        });
        return view;
    }

    /**
     * Renders the maturity/strategic-importance landscape, unresolved inputs, and validated goals.
     * Implements the visualization parts of Moves 4-5; rounded coordinates are display-only.
     * @param {Object} activeModel Active Archi model.
     * @param {Object[]} results Assessment engine results.
     * @param {Object<string,?Object>} plans Preflight-approved view references.
     * @returns {Object} Matrix and goals view.
     */
    function drawMatrix(activeModel, results, plans) {
        const view = obtainView(activeModel, NAMES.matrix, "moves-4-5-matrix", plans);
        view.documentation =
            "Move 4 compares exact maturity and strategic-importance scores; Move 5 lists validated increment Goals. " +
            "Matrix placement is rounded for display only.";
        clearView(view);
        card(activeModel, view, "matrix:title", "[CBP] ML-SI Matrix",
            "Horizontal: maturity 0-4. Vertical: strategic importance 0-4.", 40, 25, 700, 50);
        for (let score = 0; score <= 4; score++) {
            card(activeModel, view, "matrix:maturity-axis:" + score,
                "[CBP] Maturity " + score, "Maturity level " + score + " of 4.",
                80 + score * 205, 75, 190, 40);
            card(activeModel, view, "matrix:importance-axis:" + score,
                "[CBP] Importance " + score, "Strategic importance level " + score + " of 4.",
                40, 100 + (4 - score) * 145, 35, 60);
        }
        const cellCounts = {};
        const capabilityObjects = {};
        let goalRow = 0;
        // ===== MOVE 4 RENDERING: Place assessed Capabilities in the Maturity-Level / Strategic-Importance matrix. =====
        results.forEach(function(result) {
            const hasScores = result.maturity !== null && result.importance !== null;
            if (hasScores) {
                const mx = Math.round(result.maturity);
                const sy = Math.round(result.importance);
                const key = mx + ":" + sy;
                const row = cellCounts[key] || 0;
                cellCounts[key] = row + 1;
                const diagramObject = object(view, result.capability, 80 + mx * 205, 100 + (4 - sy) * 145 + row * 75, 190, 60);
                capabilityObjects[root.cbpRunState.idOf(result.capability)] = diagramObject;
                if (diagramObject && diagramObject.setFillColor) {
                    diagramObject.setFillColor(result.zone === "Gap" ? "#F4CCCC" :
                        (result.zone === "Comfort" ? "#D9EAD3" : "#FFF2CC"));
                }
                const detailObject = card(activeModel, view, "matrix:detail:" + result.capability.id,
                    "[CBP] " + elementLabel(result.capability),
                    "Maturity " + result.maturity.toFixed(2) + " | Importance " + result.importance.toFixed(2) +
                    "\nZone: " + result.zone + " | SI-ML: " + result.gap.toFixed(2) +
                    candidateContext(result.capability),
                    80 + mx * 205, 165 + (4 - sy) * 145 + row * 75, 190, 50);
                const association = ensureRelationship(
                    activeModel, "association-relationship", "ML-SI assessment for capability",
                    detailObject.concept, result.capability
                );
                view.add(association, detailObject, diagramObject);
            }
            if (result.errors.length) {
                const statusRow = cellCounts.unresolved || 0;
                card(activeModel, view, "matrix:unresolved:" + result.capability.id,
                    "[CBP] Inputs incomplete - " + elementLabel(result.capability),
                    result.errors.join("\n"), 40, 900 + statusRow * 80, 900, 70);
                cellCounts.unresolved = statusRow + 1;
            }
            // ===== MOVE 5 RENDERING: Add only validated increment Goals to the matrix work product. =====
            result.goals.forEach(function(target) {
                const goal = generatedConcept(activeModel, "goal",
                    "goal:" + result.capability.id + ":" + target.year,
                    "CBP Goal - " + elementLabel(result.capability) + " - " + target.year,
                    "Increment " + target.year + "\nOverall maturity target: " + target.overall.toFixed(2) +
                    "\nPeople: " + target.dimensions.People + " | Process: " + target.dimensions.Process +
                    " | Technology: " + target.dimensions.Technology);
                root.cbpModelInputs.writeProperty(goal, "CBP.SourceCapabilityID", result.capability.id);
                root.cbpModelInputs.writeProperty(goal, "CBP.Increment", target.year);
                const goalObject = object(view, goal, 40, 1250 + (goalRow * 80), 330, 65);
                goalRow++;
                const capabilityObject = capabilityObjects[root.cbpRunState.idOf(result.capability)];
                if (capabilityObject) {
                    const influence = ensureRelationship(
                        activeModel, "influence-relationship", "Capability maturity target " + target.year,
                        result.capability, goal
                    );
                    view.add(influence, capabilityObject, goalObject);
                }
            });
        });
        return view;
    }

    /**
     * Reuses a relationship with the same type and endpoints, or creates it when absent.
     * @param {Object} activeModel Active Archi model.
     * @param {string} type ArchiMate relationship type.
     * @param {string} name Relationship name.
     * @param {Object} source Source concept.
     * @param {Object} target Target concept.
     * @returns {Object} Existing or newly created relationship.
     * @throws {Error} If duplicate relationships with the same endpoints already exist.
     */
    function ensureRelationship(activeModel, type, name, source, target) {
        const sourceId = root.cbpRunState.idOf(source);
        const targetId = root.cbpRunState.idOf(target);
        const matches = root.cbpRunState.query("relationship").filter(function(relationship) {
            if (root.cbpRunState.typeOf(relationship) !== type) return false;
            const from = relationship.getSource();
            const to = relationship.getTarget();
            return from && to && root.cbpRunState.idOf(from) === sourceId &&
                root.cbpRunState.idOf(to) === targetId;
        });
        if (matches.length > 1) throw new Error("Duplicate model relationships found for " + name + ".");
        return matches.length ? matches[0] : activeModel.createRelationship(type, name, source, target);
    }

    /**
     * Renders validated improvement Work Packages grouped into increment projects.
     * Implements Moves 6-7 from explicitly entered action, project, and priority properties.
     * @param {Object} activeModel Active Archi model.
     * @param {Object[]} results Assessment engine results.
     * @param {Object<string,?Object>} plans Preflight-approved view references.
     * @returns {Object} Actions and change-portfolio view.
     */
    function drawPortfolio(activeModel, results, plans) {
        const view = obtainView(activeModel, NAMES.portfolio, "moves-6-7-portfolio", plans);
        view.documentation =
            "Actions and project packages are generated only from complete CBP.Action, CBP.Project, and " +
            "CBP.ProjectPriority inputs. Lower priority numbers rank first.";
        clearView(view);
        const dimensionColors = {
            People: "#CFE2F3",
            Process: "#D9EAD3",
            Technology: "#D9D2E9"
        };
        const zoneColors = {
            Gap: "#F4CCCC",
            Comfort: "#D9EAD3",
            Acceptance: "#FFF2CC"
        };
        const capabilityResults = {};
        results.forEach(function(result) {
            capabilityResults[root.cbpRunState.idOf(result.capability)] = result;
        });
        const legendItems = [
            ["[CBP] People actions", dimensionColors.People],
            ["[CBP] Process actions", dimensionColors.Process],
            ["[CBP] Technology actions", dimensionColors.Technology],
            ["[CBP] Capability: Gap", zoneColors.Gap],
            ["[CBP] Capability: Comfort", zoneColors.Comfort],
            ["[CBP] Capability: Acceptance", zoneColors.Acceptance]
        ];
        legendItems.forEach(function(item, index) {
            const legend = card(activeModel, view, "portfolio:legend:" + index, item[0],
                index < 3 ? "Action Work Packages are colored by improvement dimension." :
                    "Capability colors use the same zone colors as the ML-SI matrix.",
                40 + (index % 3) * 260, 25 + Math.floor(index / 3) * 55, 245, 45);
            if (legend && legend.setFillColor) legend.setFillColor(item[1]);
        });
        const groups = {};
        // ===== MOVE 6: Materialize validated dimension-level improvement actions as Work Packages. =====
        results.forEach(function(result) {
            result.actions.forEach(function(action) {
                const groupKey = action.year + "|" + action.projectName;
                if (!groups[groupKey]) groups[groupKey] = {
                    year: action.year, name: action.projectName, priority: action.priority, actions: [], conflict: false
                };
                if (groups[groupKey].priority !== action.priority) groups[groupKey].conflict = true;
                groups[groupKey].actions.push(action);
            });
        });
        // ===== MOVE 7: Group actions into increment/project packages and order projects by declared priority. =====
        const list = Object.keys(groups).map(function(key) { return groups[key]; })
            .sort(function(a, b) { return a.year === b.year ? a.priority - b.priority : a.year.localeCompare(b.year); });
        let row = 0;
        list.forEach(function(group) {
            if (group.conflict) {
                card(activeModel, view, "portfolio:conflict:" + group.year + ":" + group.name,
                    "[CBP] Priority conflict - " + group.name,
                    "Project '" + group.name + "' in " + group.year + " has conflicting priorities. No actions in this " +
                    "project are generated in the portfolio until corrected.", 40, 150 + row * 110, 900, 70);
                row++;
                return;
            }
            const project = generatedConcept(activeModel, "work-package",
                "project:" + group.year + ":" + group.name,
                "CBP Project - " + group.year + " - " + group.name,
                "Increment: " + group.year + "\nPriority: " + group.priority);
            root.cbpModelInputs.writeProperty(project, "CBP.Increment", group.year);
            root.cbpModelInputs.writeProperty(project, "CBP.Priority", group.priority);
            const projectObject = object(view, project, 40, 150 + row * 130, 300, 85);
            if (projectObject && projectObject.setFillColor) projectObject.setFillColor("#D9D9D9");
            group.actions.forEach(function(action, index) {
                // ===== MOVE 6 RENDERING: Create the validated action Work Package and its traceable links. =====
                const actionElement = generatedConcept(activeModel, "work-package",
                    "action:" + action.capability.id + ":" + action.year + ":" + action.dimension,
                    "CBP Action - " + action.year + " - " + elementLabel(action.capability) +
                        " - " + action.dimension,
                    action.description + "\nDimension transition: " + action.start + " to " + action.target + ".");
                [
                    ["CBP.Increment", action.year], ["CBP.Dimension", action.dimension],
                    ["CBP.StartLevel", action.start], ["CBP.TargetLevel", action.target],
                    ["CBP.ProjectName", action.projectName], ["CBP.Priority", action.priority],
                    ["CBP.SourceCapabilityID", root.cbpRunState.idOf(action.capability)]
                ].forEach(function(pair) { root.cbpModelInputs.writeProperty(actionElement, pair[0], pair[1]); });
                const actionObject = object(view, actionElement, 390, 150 + row * 130 + index * 75, 360, 65);
                if (actionObject && actionObject.setFillColor) {
                    actionObject.setFillColor(dimensionColors[action.dimension] || "#EAD1DC");
                }
                const capabilityObject = object(
                    view, action.capability, 800, 150 + row * 130 + index * 75, 250, 65
                );
                const capabilityResult = capabilityResults[root.cbpRunState.idOf(action.capability)];
                if (capabilityObject && capabilityObject.setFillColor) {
                    capabilityObject.setFillColor(
                        capabilityResult && zoneColors[capabilityResult.zone]
                            ? zoneColors[capabilityResult.zone]
                            : "#D9D9D9"
                    );
                }
                ensureRelationship(activeModel, "composition-relationship",
                    "Project contains improvement action", project, actionElement);
                ensureRelationship(activeModel, "realization-relationship",
                    "Implements capability improvement", actionElement, action.capability);
                const contains = ensureRelationship(
                    activeModel, "composition-relationship", "Project contains improvement action",
                    project, actionElement
                );
                const realizes = ensureRelationship(
                    activeModel, "realization-relationship", "Implements capability improvement",
                    actionElement, action.capability
                );
                view.add(contains, projectObject, actionObject);
                view.add(realizes, actionObject, capabilityObject);
            });
            row += Math.max(1, group.actions.length);
        });
        if (!list.length) {
            card(activeModel, view, "portfolio:none", "[CBP] No validated improvement actions",
                "No valid action records were derived. Review the matrix view for missing or invalid target/action inputs.",
                40, 150, 900, 75);
        }
        let errorRow = row;
        results.forEach(function(result) {
            if (!result.errors.length) return;
            card(activeModel, view, "portfolio:inputs:" + result.capability.id,
                "[CBP] Planning inputs incomplete - " + elementLabel(result.capability),
                result.errors.join("\n"), 40, 150 + errorRow * 130, 900, 90);
            errorRow++;
        });
        return view;
    }

    /**
     * Creates a navigational summary of the Move 1-7 views and this run's unresolved input count.
     * @param {Object} activeModel Active Archi model.
     * @param {Object} run Completed workflow record.
     * @param {Object[]} results Assessment results.
     * @param {Object<string,?Object>} plans Preflight-approved view references.
     * @returns {Object} Workflow overview view.
     */
    function drawOverview(activeModel, run, results, plans) {
        const view = obtainView(activeModel, NAMES.overview, "workflow-overview", plans);
        view.documentation = "CBP Moves 1-7 overview for run " + run.runId + ". See the Capability Map, input " +
            "worklists, and assessment, matrix, and portfolio views for detailed evidence and unresolved inputs.";
        clearView(view);
        const links = [
            [NAMES.capabilityMap, "Move 1 Capability-only map and modeled hierarchy"],
            [NAMES.profile, "Move 1 Capability profile and input properties"],
            [NAMES.strategies, "Move 1 strategy-role and impact inputs"],
            [NAMES.maturity, "Move 2 maturity assessment"],
            [NAMES.importance, "Move 3 strategic-importance assessment"],
            [NAMES.matrix, "Moves 4-5 landscape and improvement goals"],
            [NAMES.portfolio, "Moves 6-7 actions and change portfolio"]
        ];
        links.forEach(function(item, index) {
            card(activeModel, view, "overview:" + index,
                "[CBP] " + item[0], item[1], 40, 40 + index * 80, 900, 70);
        });
        const unresolved = results.reduce(function(total, result) {
            return total + result.errors.length;
        }, 0);
        card(activeModel, view, "overview:run-summary", "[CBP] Run summary",
            "Run: " + run.runId + "\nCapabilities: " + results.length +
            "\nSelected strategies: " + run.strategyIds.length +
            "\nUnresolved input messages: " + unresolved +
            "\nSave the model after reviewing all outputs.", 40, 630, 900, 90);
        return view;
    }

    root.cbpViewGenerator = Object.freeze({
        NAMES: NAMES,
        findView: findView,
        preflightViews: preflightViews,
        drawSetup: drawSetup,
        drawHeatmap: drawHeatmap,
        drawMatrix: drawMatrix,
        drawPortfolio: drawPortfolio,
        drawOverview: drawOverview
    });
})(typeof globalThis !== "undefined" ? globalThis : this);

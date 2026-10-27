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
 * Idempotent creation and rebuilding of CBP-managed Archi views.
 */
(function(root) {
    "use strict";

    const OWNER = root.cbpRunState.OWNER;
    const VIEW_MARKER = "CBP.ManagedBy";
    const VIEW_KEY = "CBP.ViewKey";
    const NAMES = {
        profile: "CBP - Capability Map and Profiles",
        strategies: "CBP - Strategy Inputs",
        maturity: "CBP - Maturity and Strategic Importance - Maturity Heatmap",
        importance: "CBP - Maturity and Strategic Importance - Strategic Importance Heatmap",
        matrix: "CBP - ML-SI Matrix and Improvement Goals",
        portfolio: "CBP - Actions and Change Portfolio",
        overview: "Capability-based Planning View"
    };
    const KEYS_BY_NAME = {};
    KEYS_BY_NAME[NAMES.profile] = "move-1-profile";
    KEYS_BY_NAME[NAMES.strategies] = "move-1-strategy-inputs";
    KEYS_BY_NAME[NAMES.maturity] = "moves-2-maturity";
    KEYS_BY_NAME[NAMES.importance] = "moves-3-importance";
    KEYS_BY_NAME[NAMES.matrix] = "moves-4-5-matrix";
    KEYS_BY_NAME[NAMES.portfolio] = "moves-6-7-portfolio";
    KEYS_BY_NAME[NAMES.overview] = "workflow-overview";

    function collectionToArray(collection) {
        const values = [];
        if (collection && typeof collection.each === "function") {
            collection.each(function(item) { values.push(item); });
        }
        return values;
    }

    function viewName(view) {
        return root.cbpRunState.nameOf(view);
    }

    function viewProperty(view, key) {
        return root.cbpRunState.property(view, key);
    }

    function elementLabel(element) {
        const code = root.cbpRunState.property(element, "CBP.InputCode");
        if (code) return root.cbpRunState.nameOf(element) + " [" + code + "]";
        const id = root.cbpRunState.idOf(element);
        return root.cbpRunState.nameOf(element) + " [ID:" + id.substring(0, 8) + "]";
    }

    function candidateContext(capability) {
        const status = root.cbpRunState.property(capability, "CBP.CandidateStatus");
        if (!status) return "";
        return "\nCandidate status: " + status + " (assessment is provisional)." +
            "\nSource: " + root.cbpRunState.property(capability, "CBP.Candidate.SourceType") +
            " - " + root.cbpRunState.property(capability, "CBP.Candidate.SourceName");
    }

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

    function findView(activeModel, name) {
        const matches = allViews(activeModel).filter(function(view) { return viewName(view) === name; });
        if (matches.length > 1) throw new Error("Several views are named '" + name + "'.");
        return matches.length ? matches[0] : null;
    }

    function preflightViews(activeModel, names, stableIds) {
        const views = allViews(activeModel);
        const plans = {};
        stableIds = stableIds || {};
        names.forEach(function(name) {
            const matches = views.filter(function(view) { return viewName(view) === name; });
            const expectedId = stableIds[name];
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

    function obtainView(activeModel, name, key, plans) {
        let view = plans && plans[name];
        if (!view) {
            view = activeModel.createArchimateView(name);
            if (!view) throw new Error("Could not create the view '" + name + "'.");
        }
        root.cbpModelInputs.writeProperty(view, VIEW_MARKER, OWNER);
        root.cbpModelInputs.writeProperty(view, VIEW_KEY, key);
        return view;
    }

    function clearView(view) {
        const children = [];
        $(view).children().each(function(child) { children.push(child); });
        children.forEach(function(child) {
            if (child && typeof child.delete === "function") child.delete();
        });
    }

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

    function object(view, concept, x, y, width, height) {
        return view.add(concept, x, y, width, height);
    }

    function card(activeModel, view, key, name, documentation, x, y, width, height) {
        const concept = generatedConcept(activeModel, "business-object", key, name, documentation);
        return object(view, concept, x, y, width, height);
    }

    function drawSetup(activeModel, capabilities, potentialStrategies, run, plans) {
        let view = obtainView(activeModel, NAMES.profile, "move-1-profile", plans);
        const profileView = view;
        view.documentation =
            "Move 1 input worklist. Enter maturity and per-year target/action properties on each Capability in its " +
            "Properties panel. Generated candidates are provisional (ReviewRequired) and are included in assessments.";
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
            const cardText = "CBP.CandidateStatus: " + (candidateStatus || "not a generated candidate") +
                (candidateStatus ? "\nProvisional source: " + source : "") +
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
            "Potential strategy worklist. Set CBP.Role=Strategy only on intended Driver, Goal, Requirement, or Course " +
            "of Action elements. Then enter CBP.Impact.<CapabilityID> (integer 0-2) for every in-scope Capability. " +
            "Strategy weights are optional and default to 1.";
        clearView(view);
        card(activeModel, view, "instructions:strategies", "[CBP] Move 1 - Strategy inputs",
            "These properties belong on the strategy element shown beside each checklist. Set CBP.Role to the exact " +
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
        return {profile: profileView, strategies: view};
    }

    function drawHeatmap(activeModel, name, key, measure, results, plans) {
        const view = obtainView(activeModel, name, key, plans);
        view.documentation = measure + " assessment from explicit CBP model inputs. Exact results are shown in cards; " +
            "unresolved inputs are listed, never imputed.";
        clearView(view);
        const colors = measure === "Maturity"
            ? ["#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#B6D7A8"]
            : ["#B6D7A8", "#D9EAD3", "#FFF2CC", "#FCE5CD", "#F4CCCC"];
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

    function drawPortfolio(activeModel, results, plans) {
        const view = obtainView(activeModel, NAMES.portfolio, "moves-6-7-portfolio", plans);
        view.documentation =
            "Actions and project packages are generated only from complete CBP.Action, CBP.Project, and " +
            "CBP.ProjectPriority inputs. Lower priority numbers rank first.";
        clearView(view);
        const groups = {};
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
        const list = Object.keys(groups).map(function(key) { return groups[key]; })
            .sort(function(a, b) { return a.year === b.year ? a.priority - b.priority : a.year.localeCompare(b.year); });
        let row = 0;
        list.forEach(function(group) {
            if (group.conflict) {
                card(activeModel, view, "portfolio:conflict:" + group.year + ":" + group.name,
                    "[CBP] Priority conflict - " + group.name,
                    "Project '" + group.name + "' in " + group.year + " has conflicting priorities. No actions in this " +
                    "project are generated in the portfolio until corrected.", 40, 60 + row * 110, 900, 70);
                row++;
                return;
            }
            const project = generatedConcept(activeModel, "work-package",
                "project:" + group.year + ":" + group.name,
                "CBP Project - " + group.year + " - " + group.name,
                "Increment: " + group.year + "\nPriority: " + group.priority);
            root.cbpModelInputs.writeProperty(project, "CBP.Increment", group.year);
            root.cbpModelInputs.writeProperty(project, "CBP.Priority", group.priority);
            const projectObject = object(view, project, 40, 60 + row * 130, 300, 85);
            group.actions.forEach(function(action, index) {
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
                const actionObject = object(view, actionElement, 390, 60 + row * 130 + index * 75, 360, 65);
                const capabilityObject = object(view, action.capability, 800, 60 + row * 130 + index * 75, 250, 65);
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
                40, 60, 900, 75);
        }
        let errorRow = row;
        results.forEach(function(result) {
            if (!result.errors.length) return;
            card(activeModel, view, "portfolio:inputs:" + result.capability.id,
                "[CBP] Planning inputs incomplete - " + elementLabel(result.capability),
                result.errors.join("\n"), 40, 60 + errorRow * 130, 900, 90);
            errorRow++;
        });
        return view;
    }

    function drawOverview(activeModel, run, results, plans) {
        const view = obtainView(activeModel, NAMES.overview, "workflow-overview", plans);
        view.documentation = "CBP Moves 1-7 overview for run " + run.runId + ". See the two input worklists and " +
            "assessment, matrix, and portfolio views for detailed evidence and unresolved inputs.";
        clearView(view);
        const links = [
            [NAMES.profile, "Move 1 Capability and profile inputs"],
            [NAMES.strategies, "Move 1 strategy-role and impact inputs"],
            [NAMES.maturity, "Move 2 maturity assessment"],
            [NAMES.importance, "Move 3 strategic-importance assessment"],
            [NAMES.matrix, "Moves 4-5 landscape and improvement goals"],
            [NAMES.portfolio, "Moves 6-7 actions and change portfolio"]
        ];
        links.forEach(function(item, index) {
            card(activeModel, view, "overview:" + index,
                "[CBP] " + item[0], item[1], 40, 50 + index * 95, 900, 70);
        });
        const unresolved = results.reduce(function(total, result) {
            return total + result.errors.length;
        }, 0);
        card(activeModel, view, "overview:run-summary", "[CBP] Run summary",
            "Run: " + run.runId + "\nCapabilities: " + results.length +
            "\nSelected strategies: " + run.strategyIds.length +
            "\nUnresolved input messages: " + unresolved +
            "\nSave the model after reviewing all outputs.", 40, 650, 900, 90);
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

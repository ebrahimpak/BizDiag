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
 * @fileoverview Calculates CBP maturity, strategic importance, landscape, goals, and actions.
 *
 * This engine turns explicit architect-supplied inputs into the repeatable assessment and planning
 * outputs corresponding to Moves 2-7 in "Capability-Based Planning, The Link between Strategy and
 * Enterprise Architecture" and "Capability-based Planning in 7 moves!". The papers provide the
 * workflow rationale; target choices, evidence quality, risk tolerance, and action design remain
 * human responsibilities.
 */
(function(root) {
    "use strict";

    /**
     * Calculates each Capability's assessment, landscape position, increment goals, and actions.
     *
     * Maturity and strategic importance are assessed first (Moves 2-3), then their difference and
     * tolerance classify the landscape (Move 4). Explicit targets and action properties are validated
     * for the configured increments (Moves 5-7). Invalid or incomplete inputs are reported rather
     * than inferred.
     *
     * @param {Object[]} capabilities In-scope Archi Capability elements.
     * @param {{element:Object, weight:number}[]} strategies Selected Courses of Action and their weights.
     * @param {string[]} increments Consecutive configured planning years.
     * @param {number} tolerance User-configured acceptance tolerance for the maturity/importance gap.
     * @param {Object} inputs CBP input parsing and weighted-calculation helper API.
     * @returns {Object[]} Per-Capability scores, errors, targets, goals, and validated actions.
     */
    function calculate(capabilities, strategies, increments, tolerance, inputs) {
        const results = [];
        for (let i = 0; i < capabilities.length; i++) {
            const capability = capabilities[i];

            // ===== MOVES 2-3: Compute maturity and strategic-importance inputs for this Capability. =====
            const maturity = inputs.calculateMaturity(capability);
            const importance = inputs.calculateImportance(capability, strategies);
            const errors = maturity.errors.concat(importance.errors);
            const result = {
                capability: capability,
                maturity: maturity.score,
                importance: importance.score,
                zone: "Not assessed",
                gap: null,
                dimensions: maturity.dimensions,
                errors: errors,
                targets: [],
                goals: [],
                actions: []
            };
            if (maturity.score !== null && importance.score !== null) {
                // ===== MOVE 4: Compare importance with maturity and classify the landscape position. =====
                // The paper's Strategic Importance/Maturity Level matrix compares these two scores:
                // a positive gap means strategic importance is higher than current maturity.
                result.gap = importance.score - maturity.score;
                // Gap Zone: SI - ML > tolerance; the capability is strategically important relative
                // to its maturity, so the difference is greater than the accepted alignment band.
                // Comfort Zone: SI - ML < -tolerance; maturity is ahead of strategic importance by
                // more than the accepted band.
                // Acceptance Band: -tolerance <= SI - ML <= tolerance; the scores are close enough
                // to be treated as aligned. The boundary values are included in this band.
                // These labels classify the landscape; they do not automatically prescribe actions.
                result.zone = result.gap > tolerance ? "Gap" :
                    (result.gap < -tolerance ? "Comfort" : "Acceptance");
            }

            // Move 5 compares each year's target with the starting maturity, then with the most
            // recent earlier target that passed all goal validations.
            let previous = {};
            for (let d = 0; d < inputs.DIMENSIONS.length; d++) {
                const dimension = inputs.DIMENSIONS[d];
                previous[dimension] = maturity.dimensions[dimension];
            }

            // ===== MOVE 5: Validate increment targets and accept only complete, consistent goals. =====
            for (let y = 0; y < increments.length; y++) {
                const year = increments[y];
                const target = {
                    year: year,
                    overall: null,
                    dimensions: {},
                    valid: true,
                    errors: [],
                    actions: []
                };
                const overallKey = "CBP.TargetML." + year;
                const overall = inputs.parseNumber(
                    inputs.readProperty(capability, overallKey), overallKey, 0, 4, true
                );
                if (!overall.valid) {
                    target.errors.push(overall.reason);
                    target.valid = false;
                } else {
                    target.overall = overall.value;
                }

                let allDimensions = true;
                const dimensionValues = [];
                const dimensionWeights = [];
                for (let d = 0; d < inputs.DIMENSIONS.length; d++) {
                    const dimension = inputs.DIMENSIONS[d];
                    const key = "CBP.Target." + dimension + "." + year;
                    const parsed = inputs.parseInteger(
                        inputs.readProperty(capability, key), key, 0, 4, true
                    );
                    if (!parsed.valid) {
                        target.errors.push(parsed.reason);
                        target.valid = false;
                        allDimensions = false;
                        continue;
                    }
                    target.dimensions[dimension] = parsed.value;
                    dimensionValues.push(parsed.value);
                    // Reuse the maturity weights (default 1 per dimension) so the entered overall
                    // target is checked against the same weighted People/Process/Technology mean.
                    const weight = inputs.parsePositiveWeight(
                        inputs.readProperty(capability, "CBP.Weight." + dimension),
                        "CBP.Weight." + dimension
                    );
                    dimensionWeights.push(weight.valid ? weight.value : 1);
                    if (!weight.valid) {
                        target.errors.push(weight.reason);
                        target.valid = false;
                    }
                    const start = previous[dimension];
                    if (start !== undefined && parsed.value < start) {
                        target.errors.push(key + " cannot be lower than the prior maturity/target.");
                        target.valid = false;
                    }
                    // ===== MOVE 6: Require explicit action, project, and priority inputs for improvements. =====
                    // An action is needed only when this dimension improves over its starting level.
                    // All three user-entered fields must be complete and valid before an action
                    // record is emitted; missing action data is reported but does not invalidate
                    // the target Goal itself.
                    if (start !== undefined && parsed.value > start) {
                        const actionKey = "CBP.Action." + dimension + "." + year;
                        const projectKey = "CBP.Project." + dimension + "." + year;
                        const priorityKey = "CBP.ProjectPriority." + dimension + "." + year;
                        const description = inputs.readProperty(capability, actionKey);
                        const projectName = inputs.readProperty(capability, projectKey);
                        const priority = inputs.parsePriority(
                            inputs.readProperty(capability, priorityKey), priorityKey
                        );
                        if (!description) target.errors.push(actionKey + " is required for an improvement.");
                        if (!projectName) target.errors.push(projectKey + " is required for an improvement.");
                        if (!priority.valid) target.errors.push(priority.reason);
                        if (description && projectName && priority.valid) {
                            // Preserve the capability, increment, dimension transition, and
                            // portfolio fields needed to create and trace this action later.
                            target.actions.push({
                                capability: capability,
                                year: year,
                                dimension: dimension,
                                start: start,
                                target: parsed.value,
                                description: description,
                                projectName: projectName,
                                priority: priority.value
                            });
                        }
                    }
                }

                if (overall.valid && allDimensions && dimensionValues.length === inputs.DIMENSIONS.length) {
                    // Require the overall target to agree with the weighted dimension target mean
                    // within 0.01; otherwise the two representations of the goal conflict.
                    const targetMean = inputs.weightedMean(dimensionValues, dimensionWeights);
                    if (Math.abs(overall.value - targetMean) > 0.01) {
                        target.errors.push(overallKey + " does not match the weighted dimension-target mean (" +
                            targetMean.toFixed(2) + ").");
                        target.valid = false;
                    }
                }
                // The final planned maturity must reach strategic importance, allowing the same
                // acceptance tolerance used to classify the Move 4 landscape.
                if (y === increments.length - 1 && overall.valid && importance.score !== null &&
                    overall.value + tolerance < importance.score) {
                    target.errors.push(overallKey + " remains below strategic importance outside the tolerance.");
                    target.valid = false;
                }
                if (maturity.score === null || importance.score === null) {
                    target.errors.push("Moves 5-7 require complete maturity and strategic-importance assessments.");
                    target.valid = false;
                }

                // Only a fully valid target becomes a Goal and advances the baseline for the next
                // increment. An invalid target is reported and does not become a later starting point.
                if (target.valid) {
                    target.actions.forEach(function(action) { result.actions.push(action); });
                    result.goals.push(target);
                    previous = target.dimensions;
                }
                result.errors = result.errors.concat(target.errors);
                result.targets.push(target);
            }
            results.push(result);
        }
        return results;
    }

    root.cbpAssessmentEngine = Object.freeze({calculate: calculate});
})(typeof globalThis !== "undefined" ? globalThis : this);

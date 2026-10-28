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
 * @fileoverview Validates CBP model properties and calculates maturity and strategic-importance inputs.
 *
 * This module operationalizes the quantitative parts of the CBP workflow described in
 * "Capability-Based Planning, The Link between Strategy and Enterprise Architecture" and
 * "Capability-based Planning in 7 moves!". The papers guide the dimensions and assessment workflow;
 * the property contract and formulas implemented here are explicit software rules, not a substitute
 * for the architect's evidence-based judgments.
 */
(function(root) {
    "use strict";

    const DIMENSIONS = ["People", "Process", "Technology"];

    /**
     * Reads and normalizes a custom model property.
     * @param {Object} object Archi model object exposing jArchi's {@code prop} method.
     * @param {string} key Exact custom-property name.
     * @returns {string} Trimmed property value, or an empty string when absent.
     */
    function readProperty(object, key) {
        const value = object && typeof object.prop === "function" ? object.prop(key) : "";
        return value === null || value === undefined ? "" : String(value).trim();
    }

    /**
     * Writes a custom property through the jArchi model-object API.
     * @param {Object} object Archi model object exposing jArchi's {@code prop} method.
     * @param {string} key Exact custom-property name.
     * @param {*} value Value converted to text before storage.
     * @throws {Error} If the supplied object cannot store properties.
     */
    function writeProperty(object, key, value) {
        if (!object || typeof object.prop !== "function") {
            throw new Error("Cannot write CBP property '" + key + "' on this model object.");
        }
        object.prop(key, String(value));
    }

    /**
     * Validates an optional or required integer input within an inclusive range.
     * Used for the papers' discrete 0-4 maturity and 0-2 strategy-impact scales.
     * @param {*} raw Input value.
     * @param {string} key Property name, used in validation messages.
     * @param {number} minimum Inclusive lower bound.
     * @param {number} maximum Inclusive upper bound.
     * @param {boolean} required Whether an empty input is invalid.
     * @returns {{valid:boolean, value:(number|null), missing?:boolean, reason?:string}}
     */
    function parseInteger(raw, key, minimum, maximum, required) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) {
            return required
                ? {valid: false, missing: true, reason: key + " is missing."}
                : {valid: true, value: null};
        }
        const value = Number(text);
        if (!isFinite(value) || Math.floor(value) !== value || value < minimum || value > maximum) {
            return {
                valid: false,
                missing: false,
                reason: key + " must be an integer from " + minimum + " to " + maximum + "."
            };
        }
        return {valid: true, value: value};
    }

    /**
     * Validates an optional or required finite numeric input within an inclusive range.
     * @param {*} raw Input value.
     * @param {string} key Property name, used in validation messages.
     * @param {number} minimum Inclusive lower bound.
     * @param {number} maximum Inclusive upper bound.
     * @param {boolean} required Whether an empty input is invalid.
     * @returns {{valid:boolean, value:(number|null), missing?:boolean, reason?:string}}
     */
    function parseNumber(raw, key, minimum, maximum, required) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) {
            return required
                ? {valid: false, missing: true, reason: key + " is missing."}
                : {valid: true, value: null};
        }
        const value = Number(text);
        if (!isFinite(value) || value < minimum || value > maximum) {
            return {
                valid: false,
                missing: false,
                reason: key + " must be a number from " + minimum + " to " + maximum + "."
            };
        }
        return {valid: true, value: value};
    }

    /**
     * Validates a positive assessment weight, applying the documented default of 1 if absent.
     * Weights implement relative emphasis in the weighted means; they are not ratings from the papers.
     * @param {*} raw Input value.
     * @param {string} key Property name, used in validation messages.
     * @returns {{valid:boolean, value?:number, reason?:string}}
     */
    function parsePositiveWeight(raw, key) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) return {valid: true, value: 1};
        const value = Number(text);
        if (!isFinite(value) || value <= 0) {
            return {valid: false, reason: key + " must be a positive number."};
        }
        return {valid: true, value: value};
    }

    /**
     * Validates a positive integer project priority; smaller values are ranked first.
     * @param {*} raw Input value.
     * @param {string} key Property name, used in validation messages.
     * @returns {{valid:boolean, value?:number, missing?:boolean, reason?:string}}
     */
    function parsePriority(raw, key) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) return {valid: false, missing: true, reason: key + " is missing."};
        const value = Number(text);
        if (!isFinite(value) || Math.floor(value) !== value || value < 1) {
            return {valid: false, missing: false, reason: key + " must be a positive integer."};
        }
        return {valid: true, value: value};
    }

    /**
     * Parses configured planning increments and requires unique consecutive four-digit years.
     * These are architect-selected planning horizons, not values inferred by the CBP papers or script.
     * @param {*} raw Comma-separated year text from {@code CBP.Increments}.
     * @returns {{valid:boolean, years?:string[], reason?:string}}
     */
    function parseIncrements(raw) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) return {valid: false, reason: "CBP.Increments is required (for example 2027,2028)."};
        const parts = text.split(",");
        const years = [];
        const seen = {};
        for (let i = 0; i < parts.length; i++) {
            const year = parts[i].trim();
            if (!/^\d{4}$/.test(year)) {
                return {valid: false, reason: "CBP.Increments must contain comma-separated four-digit years."};
            }
            if (seen[year]) return {valid: false, reason: "CBP.Increments contains duplicate year " + year + "."};
            seen[year] = true;
            years.push(year);
        }
        years.sort();
        for (let i = 1; i < years.length; i++) {
            if (Number(years[i]) !== Number(years[i - 1]) + 1) {
                return {valid: false, reason: "CBP.Increments must contain consecutive years."};
            }
        }
        return {valid: true, years: years};
    }

    /**
     * Computes a normalized weighted arithmetic mean.
     * @param {number[]} values Assessment values.
     * @param {number[]} weights Positive weights corresponding by index to values.
     * @returns {?number} Weighted mean, or null for empty/mismatched input.
     */
    function weightedMean(values, weights) {
        if (!values.length || values.length !== weights.length) return null;
        let total = 0;
        let weightTotal = 0;
        for (let i = 0; i < values.length; i++) {
            total += values[i] * weights[i];
            weightTotal += weights[i];
        }
        return weightTotal > 0 ? total / weightTotal : null;
    }

    // ===== MOVE 2: Calculate a Capability's weighted maturity assessment. =====
    /**
     * Calculates a Capability's overall maturity from People, Process, and Technology ratings.
     * Implements the weighted-mean calculation used for CBP maturity assessment; all three
     * dimensions must have valid 0-4 integer ratings for a score to be returned.
     * @param {Object} capability Archi Capability carrying the maturity and optional weight properties.
     * @returns {{score:(number|null), dimensions:Object, weights:number[], errors:string[]}}
     */
    function calculateMaturity(capability) {
        const ratings = [];
        const weights = [];
        const errors = [];
        const byDimension = {};
        for (let i = 0; i < DIMENSIONS.length; i++) {
            const dimension = DIMENSIONS[i];
            const key = "CBP.Maturity." + dimension;
            const rating = parseInteger(readProperty(capability, key), key, 0, 4, true);
            if (!rating.valid) {
                errors.push(rating.reason);
                continue;
            }
            const weightKey = "CBP.Weight." + dimension;
            const weight = parsePositiveWeight(readProperty(capability, weightKey), weightKey);
            if (!weight.valid) {
                errors.push(weight.reason);
                continue;
            }
            byDimension[dimension] = rating.value;
            ratings.push(rating.value);
            weights.push(weight.value);
        }
        return {
            score: ratings.length === DIMENSIONS.length ? weightedMean(ratings, weights) : null,
            dimensions: byDimension,
            weights: weights,
            errors: errors
        };
    }

    // ===== MOVE 3: Calculate strategy-weighted Capability importance on the 0-4 scale. =====
    /**
     * Calculates one Capability's normalized strategic importance from selected Course of Action impacts.
     * Each impact is an integer from 0 to 2; the weighted mean is multiplied by two to map it to 0-4.
     * Strategy selection and impact judgments remain the user's responsibility, consistent with the
     * papers' emphasis on explicit strategy-to-capability assessment.
     * @param {Object} capability Archi Capability being assessed.
     * @param {{element:Object, weight:number}[]} strategies Courses of Action marked as strategies.
     * @returns {{score:(number|null), errors:string[]}}
     */
    function calculateImportance(capability, strategies) {
        const impacts = [];
        const weights = [];
        const errors = [];
        if (!strategies.length) {
            errors.push("No strategy elements are marked CBP.Role=Strategy.");
            return {score: null, errors: errors};
        }
        for (let i = 0; i < strategies.length; i++) {
            const strategy = strategies[i];
            const code = readProperty(capability, "CBP.InputCode");
            const key = "CBP.Impact." + (code || String(capability.id));
            const legacyKey = "CBP.Impact." + String(capability.id);
            let raw = readProperty(strategy.element, key);
            let displayedKey = key;
            if (!raw && code && legacyKey !== key) {
                raw = readProperty(strategy.element, legacyKey);
                if (raw) displayedKey = legacyKey;
            }
            const score = parseInteger(raw, displayedKey, 0, 2, true);
            if (!score.valid) {
                errors.push(strategy.element.name + ": " + score.reason);
                continue;
            }
            impacts.push(score.value);
            weights.push(strategy.weight);
        }
        return {
            score: impacts.length === strategies.length ? weightedMean(impacts, weights) * 2 : null,
            errors: errors
        };
    }

    root.cbpModelInputs = Object.freeze({
        DIMENSIONS: DIMENSIONS,
        readProperty: readProperty,
        writeProperty: writeProperty,
        parseInteger: parseInteger,
        parseNumber: parseNumber,
        parsePositiveWeight: parsePositiveWeight,
        parsePriority: parsePriority,
        /**
         * Builds the exact strategy property key that rates a Capability.
         * @param {Object} capability Archi Capability with a stable CBP.InputCode.
         * @returns {string} Impact key such as {@code CBP.Impact.CAP-001}.
         */
        impactKey: function(capability) {
            return "CBP.Impact." + (readProperty(capability, "CBP.InputCode") || String(capability.id));
        },
        parseIncrements: parseIncrements,
        weightedMean: weightedMean,
        calculateMaturity: calculateMaturity,
        calculateImportance: calculateImportance
    });
})(typeof globalThis !== "undefined" ? globalThis : this);

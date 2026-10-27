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
 * Pure CBP input parsing and calculation helpers shared by the Archi scripts.
 */
(function(root) {
    "use strict";

    const DIMENSIONS = ["People", "Process", "Technology"];

    function readProperty(object, key) {
        const value = object && typeof object.prop === "function" ? object.prop(key) : "";
        return value === null || value === undefined ? "" : String(value).trim();
    }

    function writeProperty(object, key, value) {
        if (!object || typeof object.prop !== "function") {
            throw new Error("Cannot write CBP property '" + key + "' on this model object.");
        }
        object.prop(key, String(value));
    }

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

    function parsePositiveWeight(raw, key) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) return {valid: true, value: 1};
        const value = Number(text);
        if (!isFinite(value) || value <= 0) {
            return {valid: false, reason: key + " must be a positive number."};
        }
        return {valid: true, value: value};
    }

    function parsePriority(raw, key) {
        const text = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!text) return {valid: false, missing: true, reason: key + " is missing."};
        const value = Number(text);
        if (!isFinite(value) || Math.floor(value) !== value || value < 1) {
            return {valid: false, missing: false, reason: key + " must be a positive integer."};
        }
        return {valid: true, value: value};
    }

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
        impactKey: function(capability) {
            return "CBP.Impact." + (readProperty(capability, "CBP.InputCode") || String(capability.id));
        },
        parseIncrements: parseIncrements,
        weightedMean: weightedMean,
        calculateMaturity: calculateMaturity,
        calculateImportance: calculateImportance
    });
})(typeof globalThis !== "undefined" ? globalThis : this);

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
 * Author: Ebrahim Pak
 *
 * @fileoverview Renders the CBP roadmap, dimension-increment, and required-action tables.
 *
 * Table rows use the assessment results and accepted Goals/actions directly; this module does not
 * recalculate maturity, strategic importance, targets, or action eligibility.
 */
(function(root) {
    "use strict";

    const DIMENSIONS = ["People", "Process", "Technology"];

    function tableCell(view, text, x, y, width, height, header) {
        const cell = view.createObject("diagram-model-note", x, y, width, height);
        cell.text = String(text);
        cell.borderType = BORDER.RECTANGLE;
        cell.fillColor = header ? "#D9EAF7" : "#FFFFFF";
        cell.fontSize = header ? 10 : 9;
        cell.fontStyle = header ? "bold" : "normal";
        cell.textAlignment = TEXT_ALIGNMENT.CENTER;
        cell.textPosition = TEXT_POSITION.CENTER;
    }

    function tableSection(view, title, columns, rows, y) {
        const x = 40;
        const rowHeight = 58;
        const totalWidth = columns.reduce(function(total, column) { return total + column.width; }, 0);
        tableCell(view, title, x, y, totalWidth, 42, true);
        y += 44;
        let columnX = x;
        columns.forEach(function(column) {
            tableCell(view, column.label, columnX, y, column.width, 42, true);
            columnX += column.width;
        });
        y += 44;
        rows.forEach(function(row, rowIndex) {
            columnX = x;
            row.forEach(function(value, columnIndex) {
                const cell = view.createObject(
                    "diagram-model-note", columnX, y, columns[columnIndex].width, rowHeight
                );
                cell.text = String(value);
                cell.borderType = BORDER.RECTANGLE;
                cell.fillColor = rowIndex % 2 ? "#F3F6F8" : "#FFFFFF";
                cell.fontSize = 9;
                cell.textAlignment = columnIndex === 0 ? TEXT_ALIGNMENT.LEFT : TEXT_ALIGNMENT.CENTER;
                cell.textPosition = TEXT_POSITION.CENTER;
                columnX += columns[columnIndex].width;
            });
            y += rowHeight;
        });
        return y + 28;
    }

    function goalForYear(result, year) {
        for (let index = 0; index < result.goals.length; index++) {
            if (result.goals[index].year === year) return result.goals[index];
        }
        return null;
    }

    function draw(activeModel, results, increments, plans) {
        const generator = root.cbpViewGenerator;
        if (!generator || typeof generator.obtainManagedView !== "function" ||
            typeof generator.clearManagedView !== "function" ||
            typeof generator.elementLabel !== "function" ||
            typeof generator.groupActions !== "function") {
            throw new Error("The shared CBP view-generation helpers are not loaded.");
        }

        const view = generator.obtainManagedView(
            activeModel, generator.NAMES.tables, "moves-5-7-tables", plans
        );
        view.documentation =
            "Tables-only summary of this CBP run's calculated assessment and validated planning results. " +
            "Includes every Capability in the Move 1 run scope; unvalidated goals are labeled rather than inferred.";
        generator.clearManagedView(view);

        const label = generator.elementLabel;
        const roadmapRows = results.map(function(result) {
            const row = [
                label(result.capability),
                result.maturity === null ? "Not assessed" : result.maturity.toFixed(2),
                result.importance === null ? "Not assessed" : result.importance.toFixed(2),
                result.zone
            ];
            increments.forEach(function(year) {
                const goal = goalForYear(result, year);
                row.push(goal ? goal.overall.toFixed(2) : "Not validated");
            });
            return row;
        });
        const roadmapColumns = [
            {label: "Capability", width: 270},
            {label: "Current maturity", width: 120},
            {label: "Strategic importance", width: 150},
            {label: "ML-SI zone", width: 120}
        ].concat(increments.map(function(year) {
            return {label: year + " target ML", width: 115};
        }));

        const dimensionRows = [];
        results.forEach(function(result) {
            const previous = {};
            DIMENSIONS.forEach(function(dimension) {
                previous[dimension] = result.dimensions[dimension];
            });
            increments.forEach(function(year) {
                const goal = goalForYear(result, year);
                const row = [label(result.capability), year];
                DIMENSIONS.forEach(function(dimension) {
                    const target = goal ? goal.dimensions[dimension] : null;
                    row.push(target === null || target === undefined
                        ? "Not validated"
                        : (previous[dimension] === undefined ? "n/a" : previous[dimension]) + " -> " + target);
                });
                row.push(goal ? goal.overall.toFixed(2) : "Not validated");
                dimensionRows.push(row);
                if (goal) {
                    DIMENSIONS.forEach(function(dimension) {
                        previous[dimension] = goal.dimensions[dimension];
                    });
                }
            });
        });

        const actionRows = [];
        generator.groupActions(results).forEach(function(group) {
            group.actions.forEach(function(action) {
                actionRows.push([
                    action.year,
                    label(action.capability),
                    action.dimension,
                    action.start + " -> " + action.target,
                    action.description,
                    action.projectName,
                    String(action.priority),
                    group.conflict ? "Priority conflict; excluded from portfolio" : "Included in portfolio"
                ]);
            });
        });
        if (!actionRows.length) {
            actionRows.push(["-", "-", "-", "-", "No validated action records for this run.", "-", "-", "-"]);
        }

        let y = 35;
        y = tableSection(view, "Capability Improvement Roadmap", roadmapColumns, roadmapRows, y);
        y = tableSection(view, "Improvement Increments by Capability Dimension", [
            {label: "Capability", width: 270},
            {label: "Increment", width: 100},
            {label: "People (start -> target)", width: 190},
            {label: "Process (start -> target)", width: 190},
            {label: "Technology (start -> target)", width: 210},
            {label: "Overall target ML", width: 140}
        ], dimensionRows, y);
        tableSection(view, "Required Actions by Increment", [
            {label: "Increment", width: 95},
            {label: "Capability", width: 230},
            {label: "Dimension", width: 100},
            {label: "Level change", width: 110},
            {label: "Required action", width: 300},
            {label: "Project", width: 200},
            {label: "Priority", width: 80},
            {label: "Portfolio status", width: 230}
        ], actionRows, y);
        return view;
    }

    root.cbpImprovementTables = Object.freeze({draw: draw});
})(typeof globalThis !== "undefined" ? globalThis : this);

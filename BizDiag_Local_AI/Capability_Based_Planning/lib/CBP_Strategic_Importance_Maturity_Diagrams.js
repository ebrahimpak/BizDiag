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
 * @fileoverview Renders the paper-inspired maturity/importance and increment-roadmap diagrams.
 *
 * This renderer consumes the assessment results produced by the CBP engine. It does not recalculate
 * scores, infer missing assessments, or create target Goals.
 */
(function(root) {
    "use strict";

    const VIEW_NAME = "CBP - Strategic Importance and Maturity Diagrams";
    const VIEW_KEY = "moves-4-7-landscape-diagrams";
    const ZONE_COLORS = {
        Gap: "#F4CCCC",
        Acceptance: "#D9EAF7",
        Comfort: "#D9EAD3"
    };
    const YEAR_COLORS = ["#E06666", "#6AA84F", "#45818E", "#8E7CC3", "#F6B26B", "#3D85C6"];

    function capabilityName(result) {
        return root.cbpRunState.nameOf(result.capability);
    }

    function hasScore(value) {
        return typeof value === "number" && isFinite(value);
    }

    function band(value) {
        return Math.max(0, Math.min(4, Math.round(value)));
    }

    function createNote(view, text, x, y, width, height, style) {
        const note = view.createObject("diagram-model-note", x, y, width, height);
        note.setText(text);
        note.borderType = BORDER.RECTANGLE;
        note.fillColor = "#FFFFFF";
        note.lineColor = "#888888";
        note.lineWidth = 1;
        note.fontSize = 9;
        note.textAlignment = TEXT_ALIGNMENT.CENTER;
        note.textPosition = TEXT_POSITION.CENTER;
        Object.keys(style || {}).forEach(function(key) {
            note[key] = style[key];
        });
        return note;
    }

    function invisibleAnchor(view, x, y) {
        const anchor = createNote(view, "", x, y, 2, 2, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            opacity: 0,
            outlineOpacity: 0
        });
        return anchor;
    }

    function connect(view, start, end, color, dashed) {
        const connection = view.createConnection(start, end);
        connection.lineColor = color;
        connection.lineWidth = 2;
        connection.style = dashed ? CONNECTION_STYLE.LINE_DASHED : CONNECTION_STYLE.LINE_SOLID;
        return connection;
    }

    function drawDiagonal(view, x1, y1, x2, y2, color) {
        const start = invisibleAnchor(view, x1, y1);
        const end = invisibleAnchor(view, x2, y2);
        connect(view, start, end, color, true);
    }

    function assessmentStatus(result) {
        const parts = [];
        if (!hasScore(result.maturity)) parts.push("Maturity unavailable");
        if (!hasScore(result.importance)) parts.push("strategic importance unavailable");
        if (!parts.length) return "";
        return capabilityName(result) + ": " + parts.join("; ");
    }

    function matrixRows(results) {
        const counts = [0, 0, 0, 0, 0];
        results.forEach(function(result) {
            if (hasScore(result.maturity) && hasScore(result.importance)) {
                counts[band(result.importance)]++;
            }
        });
        return counts.map(function(count) {
            return Math.max(76, count * 46 + 8);
        });
    }

    function drawDiscreteMatrix(view, results, startY, mode, tolerance) {
        const left = 210;
        const cellWidth = 118;
        const rowHeights = matrixRows(results);
        const rowTop = {};
        let gridTop = startY + 82;
        for (let importance = 4; importance >= 0; importance--) {
            rowTop[importance] = gridTop;
            gridTop += rowHeights[importance];
        }
        const gridBottom = gridTop;
        const gridWidth = cellWidth * 5;

        for (let importance = 4; importance >= 0; importance--) {
            for (let maturity = 0; maturity <= 4; maturity++) {
                let fill = "#EEF2F6";
                if (mode === "zones") {
                    const gap = importance - maturity;
                    fill = gap > tolerance ? ZONE_COLORS.Gap :
                        (gap < -tolerance ? ZONE_COLORS.Comfort : ZONE_COLORS.Acceptance);
                }
                createNote(view, "", left + maturity * cellWidth, rowTop[importance],
                    cellWidth, rowHeights[importance], {
                        fillColor: fill,
                        lineColor: "#FFFFFF",
                        lineWidth: 2,
                        fontSize: 1
                    });
            }
            createNote(view, String(importance), left - 48, rowTop[importance], 38,
                rowHeights[importance], {
                    borderType: BORDER.NONE,
                    fillColor: "#FFFFFF",
                    lineColor: "#FFFFFF",
                    fontSize: 10
                });
        }

        for (let maturity = 0; maturity <= 4; maturity++) {
            createNote(view, String(maturity), left + maturity * cellWidth,
                gridBottom + 3, cellWidth, 28, {
                    borderType: BORDER.NONE,
                    fillColor: "#FFFFFF",
                    lineColor: "#FFFFFF",
                    fontSize: 10
                });
        }
        createNote(view, "Strategic Importance", 35, startY + 30, 165, 38, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            fontSize: 10,
            fontStyle: "italic"
        });
        createNote(view, "Maturity Level", left, gridBottom + 35, gridWidth, 28, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            fontSize: 10,
            fontStyle: "italic"
        });

        if (mode === "neutral" || mode === "zones") {
            const firstRow = rowTop[0];
            const lastRow = rowTop[4];
            drawDiagonal(
                view,
                left + cellWidth / 2,
                firstRow + rowHeights[0] / 2,
                left + gridWidth - cellWidth / 2,
                lastRow + rowHeights[4] / 2,
                mode === "zones" ? "#E06666" : "#666666"
            );
        }

        const cellCounts = {};
        results.forEach(function(result) {
            if (!hasScore(result.maturity) || !hasScore(result.importance)) return;
            const maturityBand = band(result.maturity);
            const importanceBand = band(result.importance);
            const key = maturityBand + ":" + importanceBand;
            const row = cellCounts[key] || 0;
            cellCounts[key] = row + 1;
            const fill = mode === "zones"
                ? (ZONE_COLORS[result.zone] || "#FFFFFF")
                : "#FFFFFF";
            const detail = mode === "zones"
                ? result.zone + " | gap " + (result.gap >= 0 ? "+" : "") + result.gap.toFixed(2)
                : "ML " + result.maturity.toFixed(2) + " | SI " + result.importance.toFixed(2);
            createNote(view, capabilityName(result) + "\n" + detail,
                left + maturityBand * cellWidth + 4,
                rowTop[importanceBand] + 4 + row * 46,
                cellWidth - 8, 40, {
                    fillColor: fill,
                    lineColor: "#333333",
                    fontSize: 8
                });
        });

        const unavailable = results.map(assessmentStatus).filter(function(line) { return line; });
        const statusText = unavailable.length
            ? unavailable.join("\n")
            : "All in-scope Capabilities have both scores and are plotted.";
        const statusTop = mode === "zones" ? startY + 222 : startY + 82;
        createNote(view,
            mode === "zones" ? "Assessment status" : "Not plotted: assessment unavailable",
            835, statusTop, 420, 32, {
                fillColor: "#F3F6F8",
                fontStyle: "bold",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        createNote(view, statusText, 835, statusTop + 36, 420,
            Math.max(64, unavailable.length * 28), {
                fillColor: unavailable.length ? "#FFF2CC" : "#FFFFFF",
                fontSize: 8,
                textAlignment: TEXT_ALIGNMENT.LEFT
            });

        if (mode === "zones") {
            ["Gap", "Acceptance", "Comfort"].forEach(function(zone, index) {
                createNote(view, zone + (zone === "Acceptance" ? " Band" : " Zone"),
                    835, startY + 82 + index * 42, 420, 34, {
                        fillColor: ZONE_COLORS[zone],
                        lineColor: "#777777",
                        textAlignment: TEXT_ALIGNMENT.LEFT
                    });
            });
        }
        return Math.max(gridBottom + 70, statusTop + 100 + unavailable.length * 28);
    }

    function clamp(value, minimum, maximum) {
        return Math.max(minimum, Math.min(maximum, value));
    }

    function goalForYear(result, year) {
        const goals = result.goals || [];
        for (let index = 0; index < goals.length; index++) {
            if (String(goals[index].year) === String(year) && hasScore(goals[index].overall)) {
                return goals[index];
            }
        }
        return null;
    }

    function drawRoadmap(view, results, increments, startY) {
        const left = 210;
        const top = startY + 84;
        const width = 600;
        const height = 360;
        const cellWidth = width / 5;
        const cellHeight = height / 5;

        for (let row = 0; row < 5; row++) {
            for (let column = 0; column < 5; column++) {
                createNote(view, "", left + column * cellWidth, top + row * cellHeight,
                    cellWidth, cellHeight, {
                        fillColor: "#EAF0F7",
                        lineColor: "#FFFFFF",
                        lineWidth: 2,
                        fontSize: 1
                    });
            }
        }
        for (let score = 0; score <= 4; score++) {
            const x = left + score * width / 4;
            const y = top + (4 - score) * height / 4;
            createNote(view, String(score), x - 25, top + height + 4, 50, 26, {
                borderType: BORDER.NONE,
                fillColor: "#FFFFFF",
                lineColor: "#FFFFFF",
                fontSize: 9
            });
            createNote(view, String(score), left - 48, y - 13, 38, 26, {
                borderType: BORDER.NONE,
                fillColor: "#FFFFFF",
                lineColor: "#FFFFFF",
                fontSize: 9
            });
        }
        createNote(view, "Strategic Importance", 30, top + height / 2 - 18, 170, 36, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            fontSize: 10,
            fontStyle: "italic"
        });
        createNote(view, "Maturity Level", left, top + height + 32, width, 28, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            fontSize: 10,
            fontStyle: "italic"
        });
        createNote(view, "Current assessment and accepted maturity targets by increment",
            835, top + 8, 420, 54, {
                fillColor: "#F3F6F8",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });

        const yearColors = {};
        increments.forEach(function(year, index) {
            yearColors[String(year)] = YEAR_COLORS[index % YEAR_COLORS.length];
            createNote(view, String(year), 835, top + 72 + index * 34, 120, 28, {
                fillColor: yearColors[String(year)],
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        });

        const point = function(maturity, importance) {
            return {
                x: left + maturity * width / 4,
                y: top + (4 - importance) * height / 4
            };
        };
        const labelCounters = {};
        results.forEach(function(result) {
            if (!hasScore(result.maturity) || !hasScore(result.importance)) return;
            const current = point(result.maturity, result.importance);
            const baseline = createNote(view, "", current.x - 6, current.y - 6, 12, 12, {
                fillColor: "#333333",
                lineColor: "#333333",
                fontSize: 1
            });
            const currentKey = "current:" + band(result.maturity) + ":" + band(result.importance);
            const currentOffset = labelCounters[currentKey] || 0;
            labelCounters[currentKey] = currentOffset + 1;
            createNote(view, capabilityName(result) + "\nCurrent ML " + result.maturity.toFixed(2) +
                " | SI " + result.importance.toFixed(2),
                clamp(current.x - 55, left, left + width - 140),
                clamp(current.y - 42 - (currentOffset % 3) * 38, top - 48, top + height - 38),
                140, 38, {
                    fillColor: "#FFFFFF",
                    lineColor: "#333333",
                    fontSize: 7
                });

            let previous = current;
            let previousAnchor = baseline;
            let previousYearIndex = -1;
            increments.forEach(function(year, yearIndex) {
                const goal = goalForYear(result, year);
                if (!goal) {
                    previous = null;
                    previousAnchor = null;
                    previousYearIndex = yearIndex;
                    return;
                }
                const target = point(goal.overall, result.importance);
                const color = yearColors[String(year)];
                const marker = createNote(view, "", target.x - 6, target.y - 6, 12, 12, {
                    fillColor: color,
                    lineColor: color,
                    fontSize: 1
                });
                if (previous && previousAnchor && previousYearIndex === yearIndex - 1) {
                    connect(view, previousAnchor, marker, color, false);
                } else if (yearIndex === 0 && previousAnchor) {
                    connect(view, previousAnchor, marker, color, false);
                }
                const labelKey = String(year) + ":" + band(goal.overall) + ":" + band(result.importance);
                const labelOffset = labelCounters[labelKey] || 0;
                labelCounters[labelKey] = labelOffset + 1;
                createNote(view, capabilityName(result) + "\n" + year + " ML " + goal.overall.toFixed(2),
                    clamp(target.x - 52, left, left + width - 140),
                    clamp(target.y + 10 + (labelOffset % 3) * 36, top - 10, top + height - 38),
                    140, 38, {
                        fillColor: color,
                        lineColor: "#555555",
                        fontSize: 7
                    });
                previous = target;
                previousAnchor = marker;
                previousYearIndex = yearIndex;
            });
        });

        const legendText = increments.length
            ? "Year colors identify configured increments. A target marker appears only for an accepted Goal."
            : "No planning increments are configured.";
        createNote(view, legendText, 835, top + 88 + increments.length * 34, 420, 54, {
            borderType: BORDER.NONE,
            fillColor: "#FFFFFF",
            lineColor: "#FFFFFF",
            textAlignment: TEXT_ALIGNMENT.LEFT,
            fontSize: 8
        });

        let y = top + height + 92;
        createNote(view, "All-scope planning status (accepted targets only; other increment values are not plotted)",
            45, y, 1210, 34, {
                fillColor: "#D9EAF7",
                fontStyle: "bold",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        y += 38;
        results.forEach(function(result, resultIndex) {
            const scores = hasScore(result.maturity) && hasScore(result.importance)
                ? "Current ML " + result.maturity.toFixed(2) + " / SI " + result.importance.toFixed(2)
                : "Not plotted: " + assessmentStatus(result).replace(capabilityName(result) + ": ", "");
            const targets = increments.map(function(year) {
                const goal = goalForYear(result, year);
                return String(year) + ": " + (goal ? "accepted ML " + goal.overall.toFixed(2) : "not validated");
            });
            createNote(view, capabilityName(result) + " | " + scores +
                (targets.length ? " | " + targets.join(" | ") : " | No increments configured"),
                45, y + resultIndex * 32, 1210, 28, {
                    fillColor: resultIndex % 2 ? "#F3F6F8" : "#FFFFFF",
                    lineColor: "#CCCCCC",
                    fontSize: 8,
                    textAlignment: TEXT_ALIGNMENT.LEFT
                });
        });
        return y + results.length * 32 + 20;
    }

    function draw(activeModel, results, increments, tolerance, plans) {
        if (!root.cbpViewGenerator ||
            typeof root.cbpViewGenerator.obtainManagedView !== "function" ||
            typeof root.cbpViewGenerator.clearManagedView !== "function") {
            throw new Error("The managed CBP view helpers are not loaded.");
        }
        const view = root.cbpViewGenerator.obtainManagedView(
            activeModel, VIEW_NAME, VIEW_KEY, plans
        );
        view.documentation =
            "Three views of the same CBP result records, inspired by the maturity/strategic-importance figures " +
            "on pages 9, 10, and 12 of 'Capability-based Planning in 7 moves!'. The first two panels plot all " +
            "assessed Capabilities using rounded display coordinates and retain exact scores in their labels. " +
            "The third panel plots only accepted Goal targets at the Capability's current strategic importance. " +
            "Unassessed Capabilities and unvalidated increments are labeled; no scores, zones, or targets are inferred.";
        root.cbpViewGenerator.clearManagedView(view);
        createNote(view, "Strategic Importance / Maturity Level — three data views",
            40, 20, 1215, 42, {
                fillColor: "#D9EAF7",
                fontStyle: "bold",
                fontSize: 12
            });

        let y = 78;
        createNote(view, "1. Score landscape — neutral grid and diagonal alignment reference",
            40, y, 1215, 34, {
                fillColor: "#F3F6F8",
                fontStyle: "bold",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        y = drawDiscreteMatrix(view, results, y + 34, "neutral", tolerance) + 18;

        createNote(view, "2. Gap Zone / Acceptance Band / Comfort Zone — tolerance-aware zone matrix",
            40, y, 1215, 34, {
                fillColor: "#F3F6F8",
                fontStyle: "bold",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        y = drawDiscreteMatrix(view, results, y + 34, "zones", tolerance) + 18;

        createNote(view, "3. Increment roadmap — current position and accepted maturity targets",
            40, y, 1215, 34, {
                fillColor: "#F3F6F8",
                fontStyle: "bold",
                textAlignment: TEXT_ALIGNMENT.LEFT
            });
        drawRoadmap(view, results, increments || [], y + 34);
        return view;
    }

    root.cbpStrategicLandscapeDiagrams = Object.freeze({draw: draw});
})(typeof globalThis !== "undefined" ? globalThis : this);

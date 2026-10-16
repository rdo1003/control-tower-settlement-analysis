//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
    AGING_CRITICAL_DAYS,
    AGING_WARNING_DAYS,
    agingTone,
    compareSeverity,
    formatCompact,
    formatDays,
    formatInteger,
    formatPercent,
    humanize,
    isTrueFlag,
    severityTone,
    shareTone,
    slaTone,
    statusTone,
    toNumber,
    TONE_LABEL,
} from "@/lib/settlement-format";

describe("severityTone", () => {
    it.each([
        ["CRITICAL", "critical"],
        ["HIGH", "warning"],
        ["MEDIUM", "caution"],
        ["LOW", "ok"],
    ])("maps %s to %s", (severity, tone) => {
        expect(severityTone(severity)).toBe(tone);
    });

    it("is case and whitespace insensitive", () => {
        expect(severityTone(" critical ")).toBe("critical");
    });

    it.each([["UNKNOWN"], [null], [undefined], [""]])("treats %s as neutral", (value) => {
        expect(severityTone(value)).toBe("neutral");
    });
});

describe("statusTone", () => {
    it("colours resolved green, escalated red and in-flight work orange", () => {
        expect(statusTone("RESOLVED")).toBe("ok");
        expect(statusTone("ESCALATED")).toBe("critical");
        expect(statusTone("INVESTIGATING")).toBe("warning");
        expect(statusTone("PENDING_COUNTERPARTY")).toBe("warning");
    });

    it("treats not-yet-worked statuses as caution", () => {
        expect(statusTone("NEW")).toBe("caution");
        expect(statusTone("TRIAGED")).toBe("caution");
    });

    it("falls back to neutral for unknown statuses", () => {
        expect(statusTone("SOMETHING_ELSE")).toBe("neutral");
    });
});

describe("SLA flags", () => {
    it("reads the text flags the source stores", () => {
        expect(isTrueFlag("True")).toBe(true);
        expect(isTrueFlag("true")).toBe(true);
        expect(isTrueFlag("False")).toBe(false);
        expect(isTrueFlag(null)).toBe(false);
    });

    it("marks a breach critical and a met SLA ok", () => {
        expect(slaTone("True")).toBe("critical");
        expect(slaTone("False")).toBe("ok");
    });
});

describe("agingTone", () => {
    it("escalates strictly above the thresholds", () => {
        expect(agingTone(AGING_WARNING_DAYS)).toBe("ok");
        expect(agingTone(AGING_WARNING_DAYS + 1)).toBe("warning");
        expect(agingTone(AGING_CRITICAL_DAYS)).toBe("warning");
        expect(agingTone(AGING_CRITICAL_DAYS + 1)).toBe("critical");
    });

    it("is neutral for missing values instead of reporting a false ok", () => {
        expect(agingTone(Number.NaN)).toBe("neutral");
    });
});

describe("shareTone", () => {
    it("escalates at the warning and critical shares", () => {
        expect(shareTone(0.1)).toBe("ok");
        expect(shareTone(0.25)).toBe("warning");
        expect(shareTone(0.5)).toBe("critical");
    });

    it("is neutral when the share cannot be computed", () => {
        expect(shareTone(Number.NaN)).toBe("neutral");
    });
});

describe("TONE_LABEL", () => {
    it("labels every tone except neutral so colour is never the only signal", () => {
        expect(TONE_LABEL.critical).toBeTruthy();
        expect(TONE_LABEL.warning).toBeTruthy();
        expect(TONE_LABEL.caution).toBeTruthy();
        expect(TONE_LABEL.ok).toBeTruthy();
        expect(TONE_LABEL.neutral).toBe("");
    });
});

describe("compareSeverity", () => {
    it("orders most urgent first and unknown values last", () => {
        const sorted = ["LOW", "UNKNOWN", "CRITICAL", "MEDIUM", "HIGH"].sort(compareSeverity);
        expect(sorted).toEqual(["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]);
    });
});

describe("humanize", () => {
    it("turns SCREAMING_SNAKE into a sentence", () => {
        expect(humanize("PENDING_COUNTERPARTY")).toBe("Pending counterparty");
    });

    it("handles empty input", () => {
        expect(humanize(null)).toBe("");
    });
});

describe("toNumber", () => {
    it("passes numbers through and parses numeric text", () => {
        expect(toNumber(12.5)).toBe(12.5);
        expect(toNumber("7")).toBe(7);
    });

    it("returns NaN rather than 0 for missing values", () => {
        expect(toNumber(null)).toBeNaN();
        expect(toNumber(undefined)).toBeNaN();
        expect(toNumber("")).toBeNaN();
        expect(toNumber("abc")).toBeNaN();
    });
});

describe("formatters", () => {
    it("formats numbers for display", () => {
        expect(formatInteger(2600)).toBe("2,600");
        expect(formatCompact(974279448.68)).toBe("974.3M");
        expect(formatPercent(0.796)).toBe("79.6%");
        expect(formatDays(5.7935)).toBe("5.8d");
    });

    it("shows a dash for values that are not numbers", () => {
        expect(formatInteger(Number.NaN)).toBe("—");
        expect(formatCompact(Number.NaN)).toBe("—");
        expect(formatPercent(Number.NaN)).toBe("—");
        expect(formatDays(Number.NaN)).toBe("—");
    });
});

//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/** Visual urgency of a value. Each tone maps to a `--color-status-*` token in global.css. */
export type Tone = "critical" | "warning" | "caution" | "ok" | "neutral";

/** Exceptions older than this many days are escalated to `warning` / `critical`. */
export const AGING_WARNING_DAYS = 3;
export const AGING_CRITICAL_DAYS = 7;

/** Share of exceptions (e.g. SLA breached, aged) at which a KPI turns `warning` / `critical`. */
export const SHARE_WARNING = 0.25;
export const SHARE_CRITICAL = 0.5;

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

/** Text shown beside a tone so meaning never depends on colour alone. */
export const TONE_LABEL: Record<Tone, string> = {
    critical: "Critical",
    warning: "Elevated",
    caution: "Watch",
    ok: "Healthy",
    neutral: "",
};

const SEVERITY_TONE: Record<string, Tone> = {
    CRITICAL: "critical",
    HIGH: "warning",
    MEDIUM: "caution",
    LOW: "ok",
};

const STATUS_TONE: Record<string, Tone> = {
    ESCALATED: "critical",
    INVESTIGATING: "warning",
    PENDING_COUNTERPARTY: "warning",
    PENDING_CUSTODIAN: "warning",
    PENDING_INTERNAL: "warning",
    AWAITING_INVENTORY: "warning",
    NEW: "caution",
    TRIAGED: "caution",
    RESOLVED: "ok",
};

const key = (value: unknown) => String(value ?? "").trim().toUpperCase();

export const severityTone = (severity: unknown): Tone => SEVERITY_TONE[key(severity)] ?? "neutral";

export const statusTone = (status: unknown): Tone => STATUS_TONE[key(status)] ?? "neutral";

/** The source stores flags as the text "True" / "False". */
export const isTrueFlag = (value: unknown): boolean => key(value) === "TRUE";

export const slaTone = (breached: unknown): Tone => (isTrueFlag(breached) ? "critical" : "ok");

export function agingTone(days: number): Tone {
    if (!Number.isFinite(days)) return "neutral";
    if (days > AGING_CRITICAL_DAYS) return "critical";
    if (days > AGING_WARNING_DAYS) return "warning";
    return "ok";
}

export function shareTone(share: number): Tone {
    if (!Number.isFinite(share)) return "neutral";
    if (share >= SHARE_CRITICAL) return "critical";
    if (share >= SHARE_WARNING) return "warning";
    return "ok";
}

/** Orders severities from most to least urgent; unknown values sort last. */
export function compareSeverity(a: unknown, b: unknown): number {
    const rank = (value: unknown) => {
        const index = (SEVERITY_ORDER as readonly string[]).indexOf(key(value));
        return index === -1 ? SEVERITY_ORDER.length : index;
    };
    return rank(a) - rank(b);
}

/** `PENDING_COUNTERPARTY` -> `Pending counterparty`. */
export function humanize(value: unknown): string {
    const words = String(value ?? "").trim().toLowerCase().replace(/_/g, " ");
    return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Null and non-numeric values become NaN so they are never shown as a misleading 0. */
export function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === "") return Number.NaN;
    return typeof value === "number" ? value : Number(value);
}

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const orDash = (value: number, format: (n: number) => string) => (Number.isFinite(value) ? format(value) : "—");

export const formatInteger = (value: number) => orDash(value, (n) => integer.format(n));
export const formatCompact = (value: number) => orDash(value, (n) => compact.format(n));
export const formatPercent = (value: number) => orDash(value, (n) => percent.format(n));
export const formatDays = (value: number) => orDash(value, (n) => `${oneDecimal.format(n)}d`);

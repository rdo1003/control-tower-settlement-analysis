//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState } from "react";
import { ArrowLeftRight, Banknote, Hourglass, Moon, RefreshCw, ShieldAlert, Sun, Timer, TriangleAlert } from "lucide-react";

import { BarChart } from "./BarChart";
import { DataTable } from "./DataTable";
import { MetricCard } from "./MetricCard";
import { QueryState } from "./QueryState";
import { ToneBadge } from "./ToneBadge";
import { useQueryRecords } from "@/hooks/use-query-records";
import { useThemeContext } from "@/hooks/theme.context";
import {
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
} from "@/lib/settlement-format";
import {
    exceptionsBySeverity,
    exceptionsByStatus,
    kpis,
    priorityExceptions,
    rootCauses,
    tradesByCurrency,
} from "@/queries/settlement";

// Query specs are module-level so each render reuses the same query string.
const KPIS = kpis();
const BY_SEVERITY = exceptionsBySeverity();
const BY_STATUS = exceptionsByStatus();
const ROOT_CAUSES = rootCauses();
const PRIORITY = priorityExceptions();
const BY_CURRENCY = tradesByCurrency();

type PriorityRow = {
    ExceptionId: string;
    Type: string;
    Severity: string;
    Status: string;
    Counterparty: string;
    AgingDays: number;
    SlaBreached: string;
    Priority: number;
};

type CurrencyRow = { Currency: string; Trades: number; GrossAmount: number };

const text = (value: unknown) => String(value ?? "");

export function SettlementDashboard() {
    const { isDark, toggleTheme } = useThemeContext();
    // Changing the key remounts the data sections, which re-runs every query.
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="dashboard">
            <header className="dashboard-header dashboard-header-row">
                <div>
                    <h1>Settlement Control Tower</h1>
                    <p className="dashboard-subtitle">
                        Settlement exceptions and root-cause analysis, live from the SettlementData semantic model.
                    </p>
                </div>
                <div className="header-actions">
                    <button type="button" className="icon-button" onClick={() => setRefreshKey((k) => k + 1)}>
                        <RefreshCw className="icon-size-200" aria-hidden="true" />
                        Refresh
                    </button>
                    <button
                        type="button"
                        className="icon-button"
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                    >
                        {isDark ? <Sun className="icon-size-200" aria-hidden="true" /> : <Moon className="icon-size-200" aria-hidden="true" />}
                    </button>
                </div>
            </header>

            <SettlementData key={refreshKey} />
        </div>
    );
}

function SettlementData() {
    return (
        <>
            <KpiSection />

            <section className="charts-grid" aria-label="Exception breakdowns">
                <SeverityChart />
                <StatusChart />
                <RootCauseChart />
            </section>

            <section className="table-section">
                <PriorityTable />
            </section>

            <section className="table-section">
                <CurrencyTable />
            </section>
        </>
    );
}

function KpiSection() {
    const { records, isLoading, error } = useQueryRecords(KPIS);

    return (
        <QueryState title="Key metrics" records={records} isLoading={isLoading} error={error}>
            {([row]) => {
                const totalTrades = toNumber(row.TotalTrades);
                const totalExceptions = toNumber(row.TotalExceptions);
                const open = toNumber(row.OpenExceptions);
                const breached = toNumber(row.SlaBreached);
                const aged = toNumber(row.AgedOver7Days);
                const avgAging = toNumber(row.AvgAgingDays);
                const breachRate = breached / totalExceptions;
                const openShare = open / totalExceptions;
                const agedShare = aged / totalExceptions;

                return (
                    <section className="metrics-grid" aria-label="Key metrics">
                        <MetricCard
                            title="Total trades"
                            value={formatInteger(totalTrades)}
                            icon={<ArrowLeftRight className="icon-size-300" aria-hidden="true" />}
                            tone="neutral"
                        />
                        <MetricCard
                            title="Open exceptions"
                            value={formatInteger(open)}
                            subtitle={`${formatPercent(openShare)} of ${formatInteger(totalExceptions)}`}
                            icon={<Hourglass className="icon-size-300" aria-hidden="true" />}
                            tone={shareTone(openShare)}
                        />
                        <MetricCard
                            title="SLA breach rate"
                            value={formatPercent(breachRate)}
                            subtitle={`${formatInteger(breached)} breached`}
                            icon={<ShieldAlert className="icon-size-300" aria-hidden="true" />}
                            tone={shareTone(breachRate)}
                        />
                        <MetricCard
                            title="Average aging"
                            value={formatDays(avgAging)}
                            icon={<Timer className="icon-size-300" aria-hidden="true" />}
                            tone={agingTone(avgAging)}
                        />
                        <MetricCard
                            title="Aged over 7 days"
                            value={formatInteger(aged)}
                            subtitle={`${formatPercent(agedShare)} of exceptions`}
                            icon={<TriangleAlert className="icon-size-300" aria-hidden="true" />}
                            tone={shareTone(agedShare)}
                        />
                        <MetricCard
                            title="Fail amount"
                            value={formatCompact(toNumber(row.FailAmount))}
                            subtitle="recorded fails"
                            icon={<Banknote className="icon-size-300" aria-hidden="true" />}
                            tone="neutral"
                        />
                    </section>
                );
            }}
        </QueryState>
    );
}

function SeverityChart() {
    const { records, isLoading, error } = useQueryRecords(BY_SEVERITY);

    return (
        <QueryState title="Exceptions by severity" records={records} isLoading={isLoading} error={error}>
            {(rows) => (
                <BarChart
                    title="Exceptions by severity"
                    data={[...rows]
                        .sort((a, b) => compareSeverity(a.Severity, b.Severity))
                        .map((row) => ({
                            label: humanize(row.Severity),
                            value: toNumber(row.Count),
                            tone: severityTone(row.Severity),
                        }))}
                    formatValue={formatInteger}
                />
            )}
        </QueryState>
    );
}

function StatusChart() {
    const { records, isLoading, error } = useQueryRecords(BY_STATUS);

    return (
        <QueryState title="Exceptions by status" records={records} isLoading={isLoading} error={error}>
            {(rows) => (
                <BarChart
                    title="Exceptions by status"
                    data={rows.map((row) => ({
                        label: humanize(row.Status),
                        value: toNumber(row.Count),
                        tone: statusTone(row.Status),
                    }))}
                    formatValue={formatInteger}
                />
            )}
        </QueryState>
    );
}

function RootCauseChart() {
    const { records, isLoading, error } = useQueryRecords(ROOT_CAUSES);

    return (
        <QueryState title="Top root causes" records={records} isLoading={isLoading} error={error}>
            {(rows) => (
                <BarChart
                    title="Top root causes"
                    data={rows.map((row) => ({ label: humanize(row.RootCause), value: toNumber(row.Count) }))}
                    formatValue={formatInteger}
                />
            )}
        </QueryState>
    );
}

function PriorityTable() {
    const { records, isLoading, error } = useQueryRecords(PRIORITY);

    return (
        <QueryState title="Priority exceptions" records={records} isLoading={isLoading} error={error}>
            {(rows) => {
                const data: PriorityRow[] = rows.map((row) => ({
                    ExceptionId: text(row.ExceptionId),
                    Type: text(row.Type),
                    Severity: text(row.Severity),
                    Status: text(row.Status),
                    Counterparty: text(row.Counterparty),
                    AgingDays: toNumber(row.AgingDays),
                    SlaBreached: text(row.SlaBreached),
                    Priority: toNumber(row.Priority),
                }));

                return (
                    <DataTable<PriorityRow>
                        title="Priority exceptions (open, highest priority first)"
                        data={data}
                        columns={[
                            {
                                key: "ExceptionId",
                                header: "Exception",
                                render: (v) => <span title={String(v)}>{String(v).slice(0, 8)}</span>,
                            },
                            { key: "Type", header: "Type", render: (v) => humanize(v) },
                            {
                                key: "Severity",
                                header: "Severity",
                                render: (v) => <ToneBadge tone={severityTone(v)}>{humanize(v)}</ToneBadge>,
                            },
                            {
                                key: "Status",
                                header: "Status",
                                render: (v) => <ToneBadge tone={statusTone(v)}>{humanize(v)}</ToneBadge>,
                            },
                            { key: "Counterparty", header: "Counterparty" },
                            {
                                key: "AgingDays",
                                header: "Aging",
                                render: (v) => <span className={`tone-text tone-${agingTone(v as number)}`}>{formatDays(v as number)}</span>,
                            },
                            {
                                key: "SlaBreached",
                                header: "SLA",
                                render: (v) => <ToneBadge tone={slaTone(v)}>{isTrueFlag(v) ? "Breached" : "Met"}</ToneBadge>,
                            },
                            { key: "Priority", header: "Priority", render: (v) => formatInteger(v as number) },
                        ]}
                    />
                );
            }}
        </QueryState>
    );
}

function CurrencyTable() {
    const { records, isLoading, error } = useQueryRecords(BY_CURRENCY);

    return (
        <QueryState title="Trades by currency" records={records} isLoading={isLoading} error={error}>
            {(rows) => {
                const data: CurrencyRow[] = rows.map((row) => ({
                    Currency: text(row.Currency),
                    Trades: toNumber(row.Trades),
                    GrossAmount: toNumber(row.GrossAmount),
                }));

                return (
                    <DataTable<CurrencyRow>
                        title="Trades by currency (top 6)"
                        data={data}
                        columns={[
                            { key: "Currency", header: "Currency" },
                            { key: "Trades", header: "Trades", render: (v) => formatInteger(v as number) },
                            { key: "GrossAmount", header: "Gross amount", render: (v) => formatCompact(v as number) },
                        ]}
                    />
                );
            }}
        </QueryState>
    );
}

//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { SettlementDashboard } from "@/components/SettlementDashboard";

const mockExecuteQuery = vi.fn();

vi.mock("@/lib/rayfin-client", () => ({
    SETTLEMENT_CONNECTION: "settlementmodel",
    getRayfinClient: () => ({
        connectors: { settlementmodel: { executeQuery: mockExecuteQuery } },
    }),
}));

// Shapes mirror the connector output captured with `rayfin connector invoke`.
const table = (columns: string[], rows: unknown[][]) => ({
    status: "success" as const,
    table: { columns: columns.map((name) => ({ name, dataType: "unknown" })), rows },
    requestId: "",
});

function answer(query: string) {
    // The priority query also selects Severity and Status columns, so match it first.
    if (query.includes('"ExceptionId"')) {
        return table(
            ["[ExceptionId]", "[Type]", "[Severity]", "[Status]", "[Counterparty]", "[AgingDays]", "[SlaBreached]", "[Priority]"],
            [
                ["3e404a13-cc06-48e1-b7ee-5472bb7b5e61", "SSI_MISMATCH", "CRITICAL", "PENDING_INTERNAL", "Sakura Securities LLC", 14, "True", 100],
                ["aaaaaaaa-0000-0000-0000-000000000000", "UNMATCHED", "LOW", "NEW", "Vantage Clearing plc", 1, "False", 20],
            ],
        );
    }
    if (query.includes('"TotalTrades"')) {
        return table(
            ["[TotalTrades]", "[TotalExceptions]", "[OpenExceptions]", "[SlaBreached]", "[FailAmount]", "[AvgAgingDays]", "[AgedOver7Days]"],
            [[2600, 2000, 1019, 1592, 974279448.68, 5.7935, 726]],
        );
    }
    if (query.includes('"Severity", exceptions[severity]')) {
        return table(["[Severity]", "[Count]"], [["LOW", 102], ["CRITICAL", 680], ["MEDIUM", 683], ["HIGH", 535]]);
    }
    if (query.includes('"Status", exceptions[exception_status]')) {
        return table(["[Status]", "[Count]"], [["RESOLVED", 981], ["PENDING_COUNTERPARTY", 184], ["ESCALATED", 141]]);
    }
    if (query.includes('"RootCause"')) {
        return table(["[RootCause]", "[Count]"], [["INVENTORY_SHORTFALL", 418]]);
    }
    return table(["[Currency]", "[Trades]", "[GrossAmount]"], [["USD", 871, 52794936902.43]]);
}

describe("SettlementDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockExecuteQuery.mockImplementation(async ({ query }: { query: string }) => answer(query));
    });

    it("renders KPI cards with conditional-formatting tones and text labels", async () => {
        const { container } = render(<SettlementDashboard />);

        await screen.findByText("2,600");

        // 79.6% of exceptions breached their SLA: critical.
        const sla = screen.getByText("SLA breach rate").closest(".metric-card");
        expect(sla).toHaveClass("tone-critical");
        expect(within(sla as HTMLElement).getByText("79.6%")).toBeInTheDocument();
        expect(within(sla as HTMLElement).getByText("Critical")).toBeInTheDocument();

        // Average aging of 5.8 days sits between the warning and critical thresholds.
        const aging = screen.getByText("Average aging").closest(".metric-card");
        expect(aging).toHaveClass("tone-warning");
        expect(within(aging as HTMLElement).getByText("5.8d")).toBeInTheDocument();

        // Values with no urgency rule stay neutral.
        expect(screen.getByText("Total trades").closest(".metric-card")).toHaveClass("tone-neutral");
        expect(container.querySelectorAll(".metric-card")).toHaveLength(6);
    });

    it("orders severities by urgency and colours each bar", async () => {
        render(<SettlementDashboard />);

        // The loading skeleton shares the chart's title, so wait for a bar label instead.
        const chart = (await screen.findByText("Critical", { selector: ".bar-label" })).closest(".chart-card") as HTMLElement;
        const labels = Array.from(chart.querySelectorAll(".bar-label")).map((el) => el.textContent);
        expect(labels).toEqual(["Critical", "High", "Medium", "Low"]);

        const rows = chart.querySelectorAll(".bar-row");
        expect(rows[0]).toHaveClass("tone-critical");
        expect(rows[1]).toHaveClass("tone-warning");
        expect(rows[2]).toHaveClass("tone-caution");
        expect(rows[3]).toHaveClass("tone-ok");
    });

    it("colours statuses: resolved green, escalated red, in-flight orange", async () => {
        render(<SettlementDashboard />);

        const chart = (await screen.findByText("Resolved", { selector: ".bar-label" })).closest(".chart-card") as HTMLElement;
        const rows = Array.from(chart.querySelectorAll(".bar-row"));
        expect(rows.map((r) => r.className)).toEqual([
            "bar-row tone-ok",
            "bar-row tone-warning",
            "bar-row tone-critical",
        ]);
    });

    it("renders priority exceptions with severity, status, aging and SLA formatting", async () => {
        render(<SettlementDashboard />);

        const critical = (await screen.findByText("3e404a13")).closest("tr") as HTMLElement;
        expect(within(critical).getByText("Critical")).toHaveClass("tone-critical");
        expect(within(critical).getByText("Pending internal")).toHaveClass("tone-warning");
        expect(within(critical).getByText("14d")).toHaveClass("tone-critical");
        expect(within(critical).getByText("Breached")).toHaveClass("tone-critical");

        const low = screen.getByText("aaaaaaaa").closest("tr") as HTMLElement;
        expect(within(low).getByText("Low")).toHaveClass("tone-ok");
        expect(within(low).getByText("1d")).toHaveClass("tone-ok");
        expect(within(low).getByText("Met")).toHaveClass("tone-ok");
    });

    it("shows an error in the failing section only, never fabricated data", async () => {
        mockExecuteQuery.mockImplementation(async ({ query }: { query: string }) =>
            query.includes('"RootCause"')
                ? { status: "error", error: { category: "api", message: "403 Forbidden" }, requestId: "" }
                : answer(query),
        );

        render(<SettlementDashboard />);

        expect(await screen.findByRole("alert")).toHaveTextContent("403 Forbidden");
        await waitFor(() => expect(screen.getByText("2,600")).toBeInTheDocument());
        expect(screen.getAllByRole("alert")).toHaveLength(1);
    });

    it("shows an empty state when a query returns no rows", async () => {
        mockExecuteQuery.mockImplementation(async ({ query }: { query: string }) =>
            query.includes('"RootCause"') ? table(["[RootCause]", "[Count]"], []) : answer(query),
        );

        render(<SettlementDashboard />);

        expect(await screen.findByText("No data available.")).toBeInTheDocument();
    });

    it("re-runs every query when Refresh is clicked", async () => {
        render(<SettlementDashboard />);
        await screen.findByText("2,600");
        const before = mockExecuteQuery.mock.calls.length;

        fireEvent.click(screen.getByRole("button", { name: /refresh/i }));

        await waitFor(() => expect(mockExecuteQuery.mock.calls.length).toBe(before * 2));
    });
});

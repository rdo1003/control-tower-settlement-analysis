//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
    exceptionsBySeverity,
    exceptionsByStatus,
    kpis,
    priorityExceptions,
    rootCauses,
    tradesByCurrency,
} from "@/queries/settlement";

// Column names exactly as returned by `rayfin connector invoke settlementmodel executeQuery`.
const CASES = [
    ["kpis", kpis, ["[TotalTrades]", "[TotalExceptions]", "[OpenExceptions]", "[SlaBreached]", "[FailAmount]", "[AvgAgingDays]", "[AgedOver7Days]"]],
    ["exceptionsBySeverity", exceptionsBySeverity, ["[Severity]", "[Count]"]],
    ["exceptionsByStatus", exceptionsByStatus, ["[Status]", "[Count]"]],
    ["rootCauses", rootCauses, ["[RootCause]", "[Count]"]],
    ["tradesByCurrency", tradesByCurrency, ["[Currency]", "[Trades]", "[GrossAmount]"]],
    ["priorityExceptions", priorityExceptions, ["[ExceptionId]", "[Type]", "[Severity]", "[Status]", "[Counterparty]", "[AgingDays]", "[SlaBreached]", "[Priority]"]],
] as const;

describe.each(CASES)("%s", (_name, factory, columns) => {
    it("returns a DAX query", () => {
        expect(factory().query).toMatch(/^\s*(\/\/[^\n]*\n\s*)*EVALUATE/);
    });

    it("excludes the header row that was loaded as data", () => {
        // The source CSVs were loaded with their header row as the first data row.
        expect(factory().query).toMatch(/<> "(trade_id|exception_id|investigation_id)"/);
    });

    it("has metadata for exactly the columns the query returns", () => {
        expect(Object.keys(factory().columnMetadata).sort()).toEqual([...columns].sort());
    });

    it("gives every column a display name and a slug without brackets", () => {
        for (const column of Object.values(factory().columnMetadata)) {
            expect(column.displayName).toBeTruthy();
            expect(column.name).toMatch(/^[A-Za-z][A-Za-z0-9]*$/);
        }
    });
});

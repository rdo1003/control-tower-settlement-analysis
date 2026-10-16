//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./kpis.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[TotalTrades]": { name: "TotalTrades", displayName: "Total trades", format: "#,##0" },
    "[TotalExceptions]": { name: "TotalExceptions", displayName: "Total exceptions", format: "#,##0" },
    "[OpenExceptions]": { name: "OpenExceptions", displayName: "Open exceptions", format: "#,##0" },
    "[SlaBreached]": { name: "SlaBreached", displayName: "SLA breached", format: "#,##0" },
    "[FailAmount]": { name: "FailAmount", displayName: "Fail amount", format: "#,##0.00" },
    "[AvgAgingDays]": { name: "AvgAgingDays", displayName: "Average aging (days)", format: "0.0" },
    "[AgedOver7Days]": { name: "AgedOver7Days", displayName: "Aged over 7 days", format: "#,##0" },
};

export function kpis() {
    return { query, columnMetadata };
}

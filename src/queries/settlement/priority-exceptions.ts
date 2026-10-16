//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./priority-exceptions.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[ExceptionId]": { name: "ExceptionId", displayName: "Exception" },
    "[Type]": { name: "Type", displayName: "Type" },
    "[Severity]": { name: "Severity", displayName: "Severity" },
    "[Status]": { name: "Status", displayName: "Status" },
    "[Counterparty]": { name: "Counterparty", displayName: "Counterparty" },
    "[AgingDays]": { name: "AgingDays", displayName: "Aging (days)", format: "0" },
    "[SlaBreached]": { name: "SlaBreached", displayName: "SLA" },
    "[Priority]": { name: "Priority", displayName: "Priority", format: "0" },
};

export function priorityExceptions() {
    return { query, columnMetadata };
}

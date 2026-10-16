//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { DataTable } from "@microsoft/fabric-visuals-core";

/**
 * Turns a `DataTable` into row objects keyed by each column's slug `name`
 * (the cleaned name from the query's column metadata).
 */
export function toRecords(table: DataTable): Record<string, unknown>[] {
    return table.rows.map((row) =>
        Object.fromEntries(table.columns.map((column, index) => [column.name, row[index] ?? null])),
    );
}

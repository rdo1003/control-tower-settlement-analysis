//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./exceptions-by-severity.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[Severity]": { name: "Severity", displayName: "Severity" },
    "[Count]": { name: "Count", displayName: "Exceptions", format: "#,##0" },
};

export function exceptionsBySeverity() {
    return { query, columnMetadata };
}

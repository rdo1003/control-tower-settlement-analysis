//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./exceptions-by-status.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[Status]": { name: "Status", displayName: "Status" },
    "[Count]": { name: "Count", displayName: "Exceptions", format: "#,##0" },
};

export function exceptionsByStatus() {
    return { query, columnMetadata };
}

//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./root-causes.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[RootCause]": { name: "RootCause", displayName: "Root cause" },
    "[Count]": { name: "Count", displayName: "Investigations", format: "#,##0" },
};

export function rootCauses() {
    return { query, columnMetadata };
}

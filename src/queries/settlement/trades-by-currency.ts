//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./trades-by-currency.dax?raw";

export const columnMetadata: ColumnMetadataMap = {
    "[Currency]": { name: "Currency", displayName: "Currency" },
    "[Trades]": { name: "Trades", displayName: "Trades", format: "#,##0" },
    "[GrossAmount]": { name: "GrossAmount", displayName: "Gross amount", format: "#,##0.00" },
};

export function tradesByCurrency() {
    return { query, columnMetadata };
}

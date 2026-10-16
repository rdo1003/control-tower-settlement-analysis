//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo } from "react";

import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable, type ColumnMetadataMap } from "@/lib/to-data-table";
import { toRecords } from "@/lib/to-records";

interface QuerySpec {
    query: string;
    columnMetadata: ColumnMetadataMap;
}

interface UseQueryRecordsResult {
    /** Rows keyed by column slug name; `undefined` until the query succeeds. */
    records: Record<string, unknown>[] | undefined;
    isLoading: boolean;
    error: Error | undefined;
}

/** Runs a query-factory result through the connector and returns rows keyed by column name. */
export function useQueryRecords({ query, columnMetadata }: QuerySpec): UseQueryRecordsResult {
    const { data, isLoading, error } = useSemanticModelQuery({ query });

    const records = useMemo(
        () => (data?.status === "success" ? toRecords(toDataTable(data.table, columnMetadata)) : undefined),
        [data, columnMetadata],
    );

    return { records, isLoading, error };
}

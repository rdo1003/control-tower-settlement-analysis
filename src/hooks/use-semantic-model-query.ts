//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import type { SemanticModelQueryResult } from "@microsoft/rayfin-connector-fabric-semanticmodel";
import { getRayfinClient, SETTLEMENT_CONNECTION } from "@/lib/rayfin-client";

interface UseSemanticModelQueryOptions {
    /** DAX query string. */
    query: string;
}

interface UseSemanticModelQueryResult {
    data: SemanticModelQueryResult | undefined;
    isLoading: boolean;
    error: Error | undefined;
    refetch: () => void;
}

/**
 * Runs a DAX query against the settlement semantic model through the Fabric Apps
 * connector, under the signed-in user's access.
 *
 * The connector reports query failures as `{ status: "error" }` rather than throwing,
 * so check `data.status` before reading `data.table`. Transport failures surface
 * through `error`.
 */
export function useSemanticModelQuery({ query }: UseSemanticModelQueryOptions): UseSemanticModelQueryResult {
    const [data, setData] = useState<SemanticModelQueryResult | undefined>();
    const [isLoading, setIsLoading] = useState(Boolean(query));
    const [error, setError] = useState<Error | undefined>();
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        if (!query) return;

        // Each run owns this flag, so a superseded or unmounted run never sets state.
        let cancelled = false;

        const run = async () => {
            setIsLoading(true);
            setError(undefined);

            try {
                const result = await getRayfinClient().connectors[SETTLEMENT_CONNECTION].executeQuery({ query });
                if (cancelled) return;

                setData(result);
                if (result.status === "error") {
                    setError(new Error(result.error.message));
                }
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [query, reloadToken]);

    const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

    return { data, isLoading, error, refetch };
}

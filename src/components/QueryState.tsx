//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { type ReactNode } from "react";

interface QueryStateProps<T> {
    title: string;
    records: T[] | undefined;
    isLoading: boolean;
    error: Error | undefined;
    children: (records: T[]) => ReactNode;
}

/** Renders the loading, error and empty states shared by every data card. */
export function QueryState<T>({ title, records, isLoading, error, children }: QueryStateProps<T>) {
    if (isLoading && !records) {
        return (
            <div className="state-card" role="status" aria-label={`Loading ${title}`}>
                <h3 className="chart-title">{title}</h3>
                <div className="state-skeleton" aria-hidden="true" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="state-card state-error" role="alert">
                <h3 className="chart-title">{title}</h3>
                <p>Couldn't load this section: {error.message}</p>
            </div>
        );
    }

    if (!records || records.length === 0) {
        return (
            <div className="state-card">
                <h3 className="chart-title">{title}</h3>
                <p className="state-empty">No data available.</p>
            </div>
        );
    }

    return <>{children(records)}</>;
}

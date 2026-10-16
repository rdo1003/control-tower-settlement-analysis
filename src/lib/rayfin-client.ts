//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ConnectorsRayfinClient } from "@microsoft/rayfin-client";
import { fabricSemanticModel } from "@microsoft/rayfin-connector-fabric-semanticmodel";

import type { AppFunctionsSchema } from "../../rayfin/functions/src/types";
import {
    connectorConfig as settlementConfig,
    type SettlementmodelSchema,
} from "../../rayfin/connectors/settlementmodel/schema";

/** Connector name declared in rayfin/rayfin.yml. */
export const SETTLEMENT_CONNECTION = "settlementmodel";

type AppConnectorsSchema = {
    [SETTLEMENT_CONNECTION]: SettlementmodelSchema;
};

export type AppRayfinClient = ConnectorsRayfinClient<
    Record<string, never>,
    AppFunctionsSchema,
    AppConnectorsSchema
>;

let _client: AppRayfinClient | undefined;

/**
 * Returns the pre-configured client singleton. It serves data entities, Functions
 * and the semantic model connector, all under the signed-in user's session.
 */
export function getRayfinClient(): AppRayfinClient {
    if (!_client) {
        const apiUrl = import.meta.env.VITE_RAYFIN_API_URL;
        const publishableKey = import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY;

        if (!apiUrl || !publishableKey) {
            throw new Error(`Missing required env vars for creating rayfin client - run 'npx rayfin up'`);
        }

        _client = new ConnectorsRayfinClient<Record<string, never>, AppFunctionsSchema, AppConnectorsSchema>(
            {
                baseUrl: apiUrl,
                publishableKey,
                authStorage: true,
                useProxy: false,
                connectors: { [SETTLEMENT_CONNECTION]: settlementConfig },
            },
            { [SETTLEMENT_CONNECTION]: fabricSemanticModel() },
        );
    }

    return _client;
}
//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { getRayfinClient } from "./rayfin-client";

/** Questions can take a while when the agent runs several queries. */
const ASK_TIMEOUT_MS = 230_000;

/**
 * Sends a question to the Fabric data agent through the `askDataAgent` function.
 * The function runs server-side, so no Fabric token or agent endpoint reaches the browser.
 */
export async function askDataAgent(question: string): Promise<string> {
    return getRayfinClient().functions.askDataAgent.invoke({ question }, { timeoutMs: ASK_TIMEOUT_MS });
}

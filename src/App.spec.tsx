//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import App from "@/App";

// Keep the smoke test offline: the dashboard would otherwise call the deployed backend.
vi.mock("@/lib/rayfin-client", () => ({
    SETTLEMENT_CONNECTION: "settlementmodel",
    getRayfinClient: () => ({
        connectors: {
            settlementmodel: {
                executeQuery: () => new Promise(() => {}),
            },
        },
        functions: { askDataAgent: { invoke: () => new Promise(() => {}) } },
    }),
}));

describe("App", () => {
    it("renders without throwing", () => {
        expect(() => render(<App />)).not.toThrow();
    });

    it("mounts content into the document", () => {
        render(<App />);
        expect(document.body).not.toBeEmptyDOMElement();
    });
});

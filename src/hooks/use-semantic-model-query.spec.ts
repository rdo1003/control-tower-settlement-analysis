//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";

const mockExecuteQuery = vi.fn();

vi.mock("@/lib/rayfin-client", () => ({
    SETTLEMENT_CONNECTION: "settlementmodel",
    getRayfinClient: () => ({
        connectors: { settlementmodel: { executeQuery: mockExecuteQuery } },
    }),
}));

const QUERY = "EVALUATE ROW(\"Value\", 1)";

describe("useSemanticModelQuery", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("starts in the loading state", () => {
        mockExecuteQuery.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useSemanticModelQuery({ query: QUERY }));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeUndefined();
    });

    it("passes the DAX query to the connector and returns a successful result", async () => {
        const success = {
            status: "success" as const,
            table: { columns: [{ name: "[Value]", dataType: "Int64" }], rows: [[1]] },
            requestId: "r1",
        };
        mockExecuteQuery.mockResolvedValue(success);

        const { result } = renderHook(() => useSemanticModelQuery({ query: QUERY }));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(mockExecuteQuery).toHaveBeenCalledWith({ query: QUERY });
        expect(result.current.data).toEqual(success);
        expect(result.current.error).toBeUndefined();
    });

    it("exposes an error when the connector reports status 'error'", async () => {
        mockExecuteQuery.mockResolvedValue({
            status: "error" as const,
            error: { category: "api", message: "401 Unauthorized" },
            requestId: "r2",
        });

        const { result } = renderHook(() => useSemanticModelQuery({ query: QUERY }));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error?.message).toBe("401 Unauthorized");
        expect(result.current.data?.status).toBe("error");
    });

    it("exposes an error when the connector call throws", async () => {
        mockExecuteQuery.mockRejectedValue(new Error("network down"));

        const { result } = renderHook(() => useSemanticModelQuery({ query: QUERY }));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error?.message).toBe("network down");
        expect(result.current.data).toBeUndefined();
    });

    it("does not run when the query is empty", () => {
        const { result } = renderHook(() => useSemanticModelQuery({ query: "" }));

        expect(mockExecuteQuery).not.toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
    });

    it("re-executes the query when refetch is called", async () => {
        mockExecuteQuery.mockResolvedValue({ status: "success", table: { columns: [], rows: [] }, requestId: "" });

        const { result } = renderHook(() => useSemanticModelQuery({ query: QUERY }));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(mockExecuteQuery).toHaveBeenCalledTimes(1);

        await act(async () => {
            await result.current.refetch();
        });

        expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });

    it("ignores a response that arrives after unmount", async () => {
        let resolve!: (value: unknown) => void;
        mockExecuteQuery.mockReturnValue(new Promise((r) => (resolve = r)));

        const { result, unmount } = renderHook(() => useSemanticModelQuery({ query: QUERY }));
        unmount();

        await act(async () => {
            resolve({ status: "success", table: { columns: [], rows: [] }, requestId: "" });
        });

        expect(result.current.data).toBeUndefined();
    });
});

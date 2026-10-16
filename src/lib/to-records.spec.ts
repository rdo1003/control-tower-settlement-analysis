//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { toRecords } from "@/lib/to-records";

describe("toRecords", () => {
    it("keys each row by the column slug name", () => {
        const records = toRecords({
            columns: [{ name: "Severity" }, { name: "Count" }],
            rows: [
                ["LOW", 102],
                ["HIGH", 535],
            ],
        });

        expect(records).toEqual([
            { Severity: "LOW", Count: 102 },
            { Severity: "HIGH", Count: 535 },
        ]);
    });

    it("turns missing cells into null", () => {
        const records = toRecords({ columns: [{ name: "A" }, { name: "B" }], rows: [["x"]] });
        expect(records).toEqual([{ A: "x", B: null }]);
    });

    it("returns an empty list for an empty table", () => {
        expect(toRecords({ columns: [{ name: "A" }], rows: [] })).toEqual([]);
    });
});

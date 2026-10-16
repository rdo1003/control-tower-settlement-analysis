//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { SettlementDashboard } from "./components/SettlementDashboard";
import { DataAgentChat } from "./components/DataAgentChat";

function App() {
    return (
        <>
            <SettlementDashboard />
            <DataAgentChat />
        </>
    );
}

export default App;

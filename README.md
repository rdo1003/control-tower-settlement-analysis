# Settlement Control Tower

A Microsoft Fabric App for settlement exception monitoring and analysis. The React dashboard queries a Power BI semantic model through a delegated Fabric connector. A server-side function connects the chat experience to a published Fabric data agent over MCP.

## Included

- Settlement KPIs, exception severity and status, root causes, priority exceptions, and trades by currency.
- Refresh controls, light/dark themes, and authenticated Fabric embedding.
- DAX query files, React components, automated tests, and the data-agent function source.
- Portable configuration examples without the original deployment's credentials or identifiers.

This repository contains the app, not a Fabric workspace export. It does not include a semantic model, lakehouse, source data, published data agent, or deployment credentials. Live data requires your own Fabric resources and permissions; there is no standalone mock-data mode.

## Prerequisites

- Node.js 22.22.2 or a supported newer version, npm, and Azure CLI.
- Access to Fabric Apps and the Rayfin tooling in your tenant.
- A published settlement semantic model and permission to query it.
- For chat, a published Fabric data agent and permissions for the app identity.

## Setup

```powershell
git clone https://github.com/rdo1003/control-tower-settlement-analysis.git
cd control-tower-settlement-analysis
npm ci
npm ci --prefix rayfin/functions
Copy-Item fabric.example.yaml fabric.yaml
Copy-Item rayfin/rayfin.example.yml rayfin/rayfin.yml
az login
```

Replace the all-zero IDs in both local configuration files with your own workspace and semantic-model IDs. Preserve the aliases: `settlementModel` in the data manifest and `settlementmodel` in the Rayfin connector.

The DAX in `src/queries/settlement/` defines the expected semantic-model contract. It references tables including `trades` and `exceptions`; inspect every query and adapt your model or the queries before connecting unrelated data. Some queries explicitly exclude CSV header rows that were present in the original demo model.

Initialize your own deployment from this directory:

```powershell
npx rayfin up
```

Follow the CLI's Fabric provisioning and authentication prompts. It generates deployment-specific environment values. Do not replace these with the original author's deployment settings. The provided `.env.example` documents the browser configuration keys; actual environment files are ignored by Git.

Configure the agent endpoint through the server-side secret store:

```powershell
npx rayfin secret set DATA_AGENT_MCP_URL
```

Enter your own published endpoint in the CLI prompt. Its shape is `https://api.fabric.microsoft.com/v1/mcp/workspaces/{workspaceId}/dataagents/{dataAgentId}/agent`. No Fabric bearer token or agent URL is sent to the browser by the chat function.

## Development And Validation

```powershell
npm test
npm run build
npm run build --prefix rayfin/functions
npm run dev
```

Open your app item in the Fabric portal and append `&devUri=http://localhost:5173` to its URL. The app expects Fabric iframe authentication and valid local deployment environment variables; opening the development URL alone is not an authenticated smoke test.

`npm run build:fabric` is the static-hosting build command in the Rayfin manifest. It generates the data client configuration and the production `dist/` bundle. Build outputs, installed packages, deployment state, and local settings are not source-controlled.

## Security And Access

The semantic-model connector uses delegated authentication. The existing `askDataAgent` function uses **application authentication**, so chat answers are based on the app owner's access to the agent's data sources, not necessarily the current viewer's access. Review this behavior and restrict app access before sharing a deployment. Do not assume viewer-specific row-level security is enforced by chat.

Never put bearer tokens, client secrets, or server-side secrets in `VITE_*` variables: Vite exposes those values to browser code. Use the Rayfin secret store for server configuration. The Rayfin publishable key is browser configuration, but generated keys and deployment records are intentionally excluded from this reusable sample.

The repository preserves the upstream MIT license. See `LICENSE` and `SECURITY.md`.

## Export Validation

Validated on 2026-10-16 with Node.js 24.17.0: all 73 tests passed, the frontend production build passed with placeholder Fabric IDs, and the server function TypeScript build passed. No authenticated live-data or browser smoke test was performed for this export.

The existing root dependency lock reports 26 npm audit advisories: 2 low, 7 moderate, 14 high, and 3 critical. These include Vite, Vitest, and transitive development/runtime dependencies. The function dependency lock reports no advisories. Dependencies were preserved from the working app rather than upgraded during packaging. Review and remediate the advisories before production use; passing tests and builds are not a security certification.
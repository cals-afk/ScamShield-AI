# ScamShield AI

AI-powered scam and phishing detection assistant that analyses suspicious messages and assigns a risk score.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/scamshield run dev` — run the frontend (port 24814)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations for OpenAI

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/scamshield)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI via Replit AI Integrations (`@workspace/integrations-openai-ai-server`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/api-server/src/routes/scam.ts` — Scam analysis route (calls OpenAI)
- `artifacts/scamshield/src/` — React frontend
- `lib/integrations-openai-ai-server/` — OpenAI client wrapper

## Architecture decisions

- OpenAPI-first: spec drives codegen which produces typed React Query hooks and Zod validators
- AI analysis done server-side only — API key never exposed to the browser
- Single-page frontend — all UX on the home route
- Result colour-coding: green (0–20%), amber (21–50%), orange (51–80%), red (81–100%)

## Product

ScamShield AI lets users paste any suspicious message (email, SMS, chat) and receive an AI-powered risk score (0–100%) with a verdict, plain-language explanation, and a breakdown of red flags, yellow flags, and safe signals.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- The OpenAI integration uses Replit-managed keys via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# Copilot Instructions for Market Data UI

This repo is a Next.js (App Router) TypeScript UI for a market data system. Use these project-specific notes to move fast and avoid common pitfalls.

## Overview
- App Router under `src/app` with routes: `/login`, `/dashboard`, `/dashboard/ticker/[id]`.
- Client-side data access via `ApiClient` with a shared base URL and 401 handling.
- Auth token stored in `localStorage`; logout clears storage and redirects to `/login`.
- UI built with Tailwind and lightweight UI primitives in `src/components/ui`.
- Componets shadcn/ui from https://ui.shadcn.com/docs/components used for base components (buttons, inputs, modals, etc).

## Run & Test
- Dev server: `npm run dev` (Next on port 3001). Stop with `npm run dev-stop`.
- Build/Start: `npm run build` / `npm start`.
- Tests: `npm test`, watch: `npm run test:watch`, coverage: `npm run test:coverage`.
- VS Code tasks available: “npm: dev” and “npm: stop”.

## Environment
- Required: `NEXT_PUBLIC_API_URL` (base URL of the backend API). In tests it’s set to `http://localhost:3000` via `jest.setup.js`.
- The API client prefixes all requests with `/api/v1`.

## Architecture & Data Flow
- `src/lib/api.ts`: `ApiClient` wraps `fetch` and adds:
  - Base URL + `/api/v1` prefix.
  - Optional `requiresAuth` (default: true) to attach `Authorization: Bearer <token>` from `localStorage`.
  - 401 handler: clears token and calls `onUnauthorized()`.
- `src/lib/useApiClient.ts`: React hook creating a memoized `ApiClient` from `NEXT_PUBLIC_API_URL` and routing to `/login` on 401.
- Example usage:
  - List: `src/components/TickersList.tsx` calls `apiClient.get('/tickers')` and client-navigates to detail.
  - Detail: `src/components/TickerDetail.tsx` calls `apiClient.get('/tickers/${id}')` and `apiClient.put('/tickers/${id}', { enabled: true })`.
  - Login: `src/app/login/page.tsx` posts to `${NEXT_PUBLIC_API_URL}/api/v1/login`, stores `token`, then routes to `/dashboard`.

## Conventions
- Client components explicitly declare `"use client"` and use `next/navigation` hooks.
- Do not hardcode `/api/v1` in call sites; pass just the endpoint (e.g., `/tickers`).
- When an endpoint is public, set `{ requiresAuth: false }` on API calls (useful in Pact tests).
- Path alias: `@/*` maps to `src/*` (see `tsconfig.json`).

## Testing Patterns
- Jest with `next/jest` lives in `jest.config.js`; jsdom environment by default.
- Global setup in `jest.setup.js`: polyfills `fetch`, mocks `next/navigation`, provides `localStorage`, and sets `NEXT_PUBLIC_API_URL`.
- React Testing Library helpers re-exported from `src/test-utils.ts`.
- Component tests often mock `useApiClient` to control responses (see `src/components/__tests__/TickersList.test.tsx`).

## Contract Tests (Pact)
- Pact tests under `src/contracts/__tests__` and component Pact tests under `src/components/__tests__`.
- Uses `@pact-foundation/pact` with a mock server on port `1234`; pacts output to `pacts/`.
- To integrate Pact with components, inject a real `ApiClient` pointing at `mockServer.url` or set `{ requiresAuth: false }` when auth headers are undesirable.

## Adding Features Quickly
- New API call: import `useApiClient()` and call `apiClient.get('/resource')` (no `/api/v1` in the path). Handle `{ data, error, status }`.
- New page: create route under `src/app/...` (client components need `"use client"`). For dashboard pages, wrap content with `DashboardLayout` via an `app/.../layout.tsx`.
- Auth-aware flows: rely on `useApiClient` 401 redirect; do not duplicate redirect logic.

## Gotchas
- Dev port is 3001 (README template mentions 3000). The API base (in tests) is 3000.
- `localStorage` is accessed only in client components. Keep API calls in client context or guard access accordingly.

Key files: `src/lib/api.ts`, `src/lib/useApiClient.ts`, `src/components/TickersList.tsx`, `src/components/TickerDetail.tsx`, `src/components/TopNavBar.tsx`, `src/contracts/__tests__/tickers.pact.test.ts`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 (App Router) TypeScript frontend for a market data system. Communicates with a backend API for ticker data. Uses Tailwind CSS v4 and shadcn/ui components.

## Commands

```bash
npm run dev           # Start dev server on port 3001
npm run dev-stop      # Kill dev server
npm run build         # Production build
npm run lint          # ESLint
npm test              # Run Jest tests
npm run test:watch    # Jest watch mode
npm run test:coverage # Coverage report
```

## Architecture

### Routing
- `/login` - Login page (stores token in localStorage)
- `/dashboard` - Ticker list view
- `/dashboard/ticker/[id]` - Ticker detail with candle chart

### API Client Pattern
All API calls go through `src/lib/api.ts` (`ApiClient` class) accessed via `useApiClient()` hook:
- Base URL from `NEXT_PUBLIC_API_URL` env var
- Automatically prefixes `/api/v1` to all endpoints
- Pass endpoints without prefix: `apiClient.get('/tickers')` not `apiClient.get('/api/v1/tickers')`
- Returns `{ data, error, status }` structure
- `requiresAuth: true` by default (attaches Bearer token from localStorage)
- 401 responses trigger token clear and redirect to `/login`

### Key Files
- [src/lib/api.ts](src/lib/api.ts) - ApiClient class wrapping fetch
- [src/lib/useApiClient.ts](src/lib/useApiClient.ts) - React hook with 401 redirect handling
- [src/components/TickersList.tsx](src/components/TickersList.tsx) - Main ticker table
- [src/components/TickerDetail.tsx](src/components/TickerDetail.tsx) - Detail view with enable/disable
- [src/components/TickerCandlesChart.tsx](src/components/TickerCandlesChart.tsx) - Lightweight Charts integration

### UI Components
shadcn/ui primitives in `src/components/ui/`. Add new components via: `npx shadcn@latest add <component>`

## Testing

### Unit/Component Tests
- Jest with jsdom environment, config in `jest.config.js`
- Global setup in `jest.setup.js` mocks fetch, router, localStorage
- Mock `useApiClient` to control API responses in component tests
- Test helpers re-exported from `src/test-utils.ts`

### Pact Contract Tests
- Consumer tests in `src/contracts/__tests__/` and `src/components/__tests__/*.pact.test.tsx`
- Mock server runs on port 1234
- Pact files output to `pacts/`
- Use `{ requiresAuth: false }` for public endpoint tests

## Conventions

- All interactive components use `"use client"` directive
- Path alias: `@/*` maps to `src/*`
- Dev server runs on port 3001; API base URL defaults to port 3000
- localStorage only accessed in client components

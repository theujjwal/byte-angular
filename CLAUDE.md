# BYTE Angular — AI Mentorship Platform

## Project Overview
Interview prep platform with AI mentorship. Modes: DSA, LLD, HLD, Work Decisions. Features chat-based coaching, thinking pattern tracking, spaced repetition drill rules, and a dashboard.

## Tech Stack
- **Angular 21** (standalone components, signals, functional interceptors/guards)
- **TypeScript 5.9**, **RxJS 7.8**, **SCSS**
- **Package manager:** pnpm 10.30
- **Testing:** Vitest 4 (jsdom) — no tests written yet
- **Build:** `pnpm start` (dev), `pnpm build` (prod)

## Architecture

### State Management
- **Angular Signals** everywhere — no NgRx or external state library
- Services expose `signal()` + `computed()` + `.asReadonly()` pattern
- HTTP calls converted to Promises via `firstValueFrom()` — async/await throughout

### Auth Flow
- Google OAuth popup → exchange token at backend → backend returns JWT
- JWT stored in `localStorage` as `byte_token`, user as `byte_user`
- `AuthService` owns all auth state (signals: `_token`, `_user`, `isAuthed`)
- `authInterceptor` attaches Bearer token, calls `signOut()` on 401
- `authGuard` protects `/chat` and `/dashboard` routes

### HTTP Layer
- `ApiService` — thin wrapper around `HttpClient` with auth headers
- `loaderInterceptor` → `authInterceptor` (order matters in app.config.ts)
- `loaderInterceptor` skips: `/chat`, `/chats/`, `/profile`

### Routing
```
/login          → LoginComponent (public)
/chat           → ChatComponent (lazy, protected)
/chat/:id       → ChatComponent (lazy, protected)
/dashboard      → DashboardComponent (lazy, protected)
/               → redirect to /chat
```

## Project Structure
```
src/app/
├── core/
│   ├── components/loader/    — global loading spinner
│   ├── guards/auth.guard.ts  — functional route guard
│   ├── interceptors/         — auth + loader interceptors
│   └── models/               — TypeScript interfaces (barrel exported via index.ts)
├── features/
│   ├── auth/login/           — Google OAuth login page
│   ├── chat/                 — 3-column layout: sidebar + messages + profile
│   │   └── components/       — chat-sidebar, chat-window, message-bubble, profile-sidebar, session-complete-card
│   └── dashboard/            — stats, pattern heatmap, drill rules
│       └── components/       — stats-cards, problem-list, pattern-heatmap, drill-rules
├── services/                 — auth, api, chat, dashboard, profile, loader, push
├── app.ts                    — root component (RouterOutlet + LoaderComponent)
├── app.routes.ts
└── app.config.ts
```

## Conventions
- **Standalone components only** — no NgModules
- **Inline templates and styles** in component decorators
- **Signals over Observables** for component state
- **Feature-first folder structure** with shared services at `services/`
- **Dark theme only** — CSS variables in `:root` (styles.scss)
- **Fonts:** Inter (sans), JetBrains Mono (mono)
- **SCSS** for component styles

## Backend API
Base URL: `environment.apiUrl` (Railway deployment)
- `POST /auth/google` — ID token auth
- `POST /auth/google-oauth` — OAuth token exchange
- `POST /chat` — send message (returns reply, patterns, progression)
- `GET /chats` — list chats
- `GET /chats/:id` — load chat with messages
- `DELETE /chats/:id` — delete chat
- `GET /profile` — thinking profile + progression
- `GET /dashboard` — stats + heatmap
- `GET /drill-rules` — spaced repetition rules
- `POST /drill-rules/review` — submit drill review

## Known Incomplete
- `AuthService.scheduleAutoLogout()` — JWT expiry handling stub, not yet implemented
- No tests written yet (Vitest configured but no .spec.ts files)
- No refresh token mechanism — session ends on JWT expiry

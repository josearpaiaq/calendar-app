# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Go)
```bash
cd backend
go run .          # start server on :8080
go build .        # compile binary
go test ./...     # run all tests
```

### Frontend (React/Vite)
```bash
cd frontend
npm install       # first time
npm run dev       # dev server at http://localhost:5173
npm run build     # tsc + vite build
npm run lint      # eslint
```

### Infrastructure
```bash
docker compose up -d    # start PostgreSQL on port 5432
docker compose down     # stop
```

## Architecture

Full-stack app: Go REST API + React SPA. The frontend never queries the DB directly — all data goes through the API.

**Dev proxy**: Vite proxies `/api` and `/uploads` to `BACKEND_URL` (default `http://localhost:8080`), so the frontend uses relative URLs in development. In production, set `VITE_API_URL` to the backend's public URL.

**Backend layout** (`backend/`):
- `main.go` — Gin setup, CORS, routes, static `/uploads` serving
- `config/` — `GetEnv(key, fallback)` helper
- `database/db.go` — PostgreSQL connection via GORM + `AutoMigrate` on startup
- `models/event.go` — single `Event` GORM model (UUID primary key, string dates `YYYY-MM-DD`)
- `handlers/events.go` — all CRUD handlers; images saved to `./uploads/` with UUID filenames
- `uploads/` — uploaded event images (served statically at `/uploads/`)

**Frontend layout** (`frontend/src/`):
- `api/events.ts` — all Axios calls to the backend
- `hooks/useEvents.ts` — single hook managing events state + CRUD (fetches by month string `YYYY-MM`)
- `types/event.ts` — `Event` and `CreateEventPayload` TypeScript interfaces
- `components/Calendar/` — `CalendarGrid` + `CalendarDay`
- `components/EventModal/` — create/edit/delete form (sends `multipart/form-data`)
- `components/PrintView/` — `MonthPrintView` using `html2canvas` + `jsPDF` and `react-to-print`

**State flow**: `App.tsx` holds `year`/`month` and the currently open modal. `useEvents(monthStr)` fetches events for the displayed month and exposes `addEvent`, `editEvent`, `removeEvent`. `CalendarGrid` calls `onMonthChange` when navigating so `App` stays in sync for `PrintView`.

**Image handling**: all event API endpoints use `multipart/form-data`. The backend stores images under `./uploads/` and returns the path as `/uploads/<filename>`. On update, the old image file is deleted before saving the new one.

**Database**: GORM auto-migrates the `events` table on every backend startup. No migration files — schema is derived from `models.Event`.

## Environment setup

Three `.env` files are required (copy from `.env.sample`):
- `.env` (root) — Docker Compose DB credentials
- `backend/.env` — Go server config (DB connection, port, CORS origins, uploads dir)
- `frontend/.env` — `BACKEND_URL` for Vite proxy (dev only), `VITE_API_URL` for production

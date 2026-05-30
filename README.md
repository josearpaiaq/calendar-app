# Calendar App

A monthly calendar where you can create events with custom images, colors, and descriptions — and print or export any month as a PDF.

## Features

- Monthly calendar view with navigation
- Create, edit and delete events on any day
- Per-event customization: title, description, time (or all-day), color and image
- Generic image placeholder when no image is provided
- Print a month or export it as PDF with all event images

---

## Getting started

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for the local database)

### 1. Environment files

Copy the sample files and fill in your values:

```bash
# Root — used by Docker Compose
cp .env.sample .env

# Backend — used by the Go server
cp backend/.env.sample backend/.env

# Frontend — used by Vite
cp frontend/.env.sample frontend/.env
```

Minimum values for local development:

**.env** (root)
```env
DB_USER=admin
DB_PASSWORD=secret
DB_NAME=calendardb
DB_PORT=5432
```

**backend/.env**
```env
PORT=8080
CORS_ORIGINS=http://localhost:5173
UPLOADS_DIR=./uploads
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=secret
DB_NAME=calendardb
DB_SSLMODE=disable
```

**frontend/.env**
```env
BACKEND_URL=http://localhost:8080
VITE_API_URL=
```

### 2. Start the database

```bash
docker compose up -d
```

Starts a PostgreSQL 16 container on port `5432`. The schema is created automatically by GORM when the backend boots.

### 3. Start the backend

```bash
cd backend
go run .
# → Server running on :8080
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS v4 |
| HTTP client | Axios |
| PDF export | html2canvas + jsPDF |
| Browser print | react-to-print |
| Backend | Go + Gin |
| ORM | GORM |
| Database | PostgreSQL 16 |
| Local DB | Docker Compose |
| Config | godotenv + os.Getenv |

---

## Architecture

```
calendar-app/
├── docker-compose.yml     # PostgreSQL service
├── .env                   # DB credentials for Docker Compose
├── .env.sample
│
├── backend/               # Go REST API
│   ├── main.go            # Server setup, CORS, routes
│   ├── config/            # GetEnv helper
│   ├── database/          # PostgreSQL connection + AutoMigrate
│   ├── models/            # Event struct (GORM model)
│   ├── handlers/          # CRUD handlers + image upload
│   └── uploads/           # Stored event images
│
└── frontend/              # React SPA
    └── src/
        ├── api/           # Axios calls to the backend
        ├── hooks/         # useEvents (state + CRUD)
        ├── types/         # TypeScript interfaces
        └── components/
            ├── Calendar/  # CalendarGrid + CalendarDay
            ├── EventModal/# Create / edit / delete form
            └── PrintView/ # Print preview + PDF export
```

The frontend never talks to the database directly. In development, Vite proxies `/api` and `/uploads` to the Go backend (`BACKEND_URL`). In production, set `VITE_API_URL` to the backend's public URL.

---

## API reference

All endpoints are under `/api`. Images are served statically from `/uploads`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/events?month=YYYY-MM` | List events for a month |
| `GET` | `/api/events/:id` | Get a single event |
| `POST` | `/api/events` | Create an event (`multipart/form-data`) |
| `PUT` | `/api/events/:id` | Update an event (`multipart/form-data`) |
| `DELETE` | `/api/events/:id` | Delete an event |
| `GET` | `/health` | Health check |

**Event fields** (`multipart/form-data`):

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `date` | string `YYYY-MM-DD` | yes |
| `description` | string | no |
| `start_time` | string `HH:MM` | no |
| `end_time` | string `HH:MM` | no |
| `color` | string hex | no (default `#3B82F6`) |
| `all_day` | bool | no (default `true`) |
| `image` | file | no |

---

## Environment variables

### Root `.env` — Docker Compose

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | Host port mapped to PostgreSQL (default `5432`) |

### `backend/.env` — Go server

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP server port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `UPLOADS_DIR` | `./uploads` | Directory for uploaded images |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | — | PostgreSQL username |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DB_NAME` | `calendardb` | PostgreSQL database name |
| `DB_SSLMODE` | `disable` | SSL mode (`disable` for local) |

### `frontend/.env` — Vite

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend URL for the Vite dev proxy (Node only) |
| `VITE_API_URL` | Backend URL exposed to the browser bundle. Empty in dev (proxy handles it), full URL in production |

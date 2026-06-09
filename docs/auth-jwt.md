# JWT Authentication

## Goal
Protect the calendar API with JWT-based auth so only you can create, edit, and delete events.

## Tasks

- [ ] **1. Install dependencies** — `go get golang.org/x/crypto/bcrypt` and `go get github.com/golang-jwt/jwt/v5` in `backend/` → Verify: both appear in `go.mod`

- [ ] **2. User model** — create `backend/models/user.go` with `ID string`, `Email string`, `PasswordHash string`, `CreatedAt time.Time`; add `&models.User{}` to `AutoMigrate` in `database/db.go` → Verify: `go build ./...` passes, table `users` appears in DB on next restart

- [ ] **3. Seed the first user** — write a small `backend/cmd/seed/main.go` that hashes a password with `bcrypt.GenerateFromPassword` and inserts one User row; run it once with `go run ./cmd/seed` → Verify: row exists in `users` table

- [ ] **4. Login handler** — create `backend/handlers/auth.go` with `POST /api/auth/login`: fetch user by email, `bcrypt.CompareHashAndPassword`, sign a JWT with `jwt.NewWithClaims` (include `user_id` + `exp` 24h), return `{"token": "..."}` → Verify: `curl -X POST localhost:8080/api/auth/login -d '{"email":"...","password":"..."}' -H 'Content-Type: application/json'` returns a token

- [ ] **5. Auth middleware** — in `backend/handlers/auth.go` add `AuthRequired() gin.HandlerFunc`: extract `Authorization: Bearer <token>`, parse and validate JWT, abort with 401 if invalid → Verify: calling a protected route without token returns 401

- [ ] **6. Protect routes** — in `backend/routes/routes.go` wrap event and settings routes with the middleware: `protected := api.Group("", handlers.AuthRequired())` → Verify: `GET /api/events` without token returns 401, with valid token returns 200

- [ ] **7. Axios interceptor** — in `frontend/src/api/events.ts` (or a new `frontend/src/lib/axios.ts`) add `axios.interceptors.request.use` that reads `localStorage.getItem('token')` and sets `Authorization: Bearer <token>` → Verify: requests in Network tab include the header

- [ ] **8. Login page** — create `frontend/src/pages/LoginPage.tsx` with email + password form, POST to `/api/auth/login`, save token with `localStorage.setItem('token', data.token)`, redirect to `/` → Verify: submitting correct credentials lands on the calendar

- [ ] **9. Protected route** — create `frontend/src/components/PrivateRoute.tsx` that checks `localStorage.getItem('token')` and renders `<Outlet />` or `<Navigate to="/login" />`; wrap `/` and `/settings` routes in `main.tsx` → Verify: opening the app without a token redirects to `/login`

- [ ] **10. Logout** — add a logout button in `Layout.tsx` that calls `localStorage.removeItem('token')` and navigates to `/login` → Verify: clicking logout returns to login screen and API calls fail with 401

## Done When
- [ ] Unauthenticated requests to the API return 401
- [ ] Correct credentials return a JWT and land on the calendar
- [ ] Page refresh keeps the session (token in localStorage)
- [ ] Logout clears the session

## Notes
- `JWT_SECRET` must be in `backend/.env` — use a long random string (e.g. `openssl rand -hex 32`)
- `bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)` for hashing
- The seed script only needs to run once; after that the user row lives in the DB
- `localStorage` is fine for a personal app; for higher security use httpOnly cookies

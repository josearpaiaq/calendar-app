# Month Backgrounds + Animated Bubbles

## Goal
Add custom background images per month (uploaded via UI, stored in backend) and replace event pills in calendar cells with animated floating bubbles.

## Tasks

- [x] **1. Centralize backend routes** — create `backend/routes/routes.go` with `Register(r *gin.Engine)`, rename `RegisterRoutes→RegisterEventRoutes` in `handlers/events.go`, update `main.go` → Verify: `go build ./...` passes

- [x] **2. MonthSetting model** — create `backend/models/month_setting.go` with `MonthSetting` struct, add to `AutoMigrate` in `database/db.go` → Verify: backend starts, table `month_settings` appears in DB

- [x] **3. Settings handlers** — create `backend/handlers/settings.go` with `GetMonthSettings`, `UpdateMonthSetting`, `RegisterSettingsRoutes`; register in `routes/routes.go` → Verify: `GET /api/settings/months` returns 200, `PUT /api/settings/months/06` with image file returns updated record

- [x] **4. React Router + layout** — `npm install react-router-dom`; wrap `main.tsx` with `<BrowserRouter>`; create `src/components/Layout.tsx` (header + `<Outlet />`); add `/` and `/settings` routes; add "Settings" link to header → Verify: `/` loads calendar, `/settings` loads without crash

- [x] **5. Settings API + hook** — create `src/api/settings.ts` (`getMonthSettings`, `updateMonthImage`); create `src/hooks/useMonthSettings.ts` → Verify: hook returns 12 entries on mount (check Network tab)

- [x] **6. MonthImageModal** — create `src/components/MonthImageModal/MonthImageModal.tsx` with file picker, current image preview, Remove button, and submit → Verify: opens, selects file, calls `updateMonthImage`, closes

- [x] **7. SettingsPage** — create `src/pages/SettingsPage.tsx` with 3×4 grid of months, each showing current image or placeholder + edit button that opens `MonthImageModal` → Verify: `/settings` shows 12 month cards, editing a month updates its image

- [x] **8. CalendarGrid backgrounds** — pass `settings` from `useMonthSettings` into `CalendarGrid`; apply current month's image as `background-image` with `rgba(0,0,0,0.45)` overlay; add pencil icon next to month name that opens `MonthImageModal` → Verify: uploading an image for current month shows it as calendar background

- [x] **9. Animated bubbles in CalendarDay** — add `@keyframes bubble-float` to `index.css`; replace pill list with bubble layout (up to 4 circles + `+N` overflow); staggered animation durations per index; click bubble → opens EventModal → Verify: day with events shows floating bubbles, clicking one opens edit modal

## Done When
- [ ] Month images persist across page reload
- [ ] Calendar background updates immediately after uploading image
- [ ] Event bubbles float and breathe independently in each cell
- [ ] `/settings` page lets you manage all 12 month images

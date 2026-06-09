# Month Backgrounds + Animated Event Bubbles

**Date:** 2026-06-04
**Status:** Approved

## Overview

Two visual features:
1. Each month can have a custom background image, uploaded via the UI and stored in the backend.
2. Events inside each calendar day cell are displayed as animated floating bubbles instead of the current pill list.

Mobile is explicitly out of scope for this iteration.

---

## Feature 1 — Month Background Images

### Visual behavior

- The month image is used as a full-background behind the entire `CalendarGrid` component.
- A dark overlay (`rgba(0, 0, 0, 0.45)`) sits on top of the image so the grid remains readable.
- If no image is set for the current month, the calendar renders with its existing white background (no change).
- The image is keyed by month number (`"01"`–`"12"`), not by year-month — so January always gets the same image regardless of year.

### How to set/edit

**Inline edit (per-month):**
- The month name in `CalendarGrid`'s header gets a pencil icon (`✏️`) next to it.
- Clicking the month name or the icon opens `MonthImageModal`.
- `MonthImageModal` is a simple modal with a file picker (and optional drag-and-drop) to upload a new image for that month. It also shows the current image if one exists, with a "Remove" option.

**Settings page:**
- New route `/settings` renders a `SettingsPage` component.
- The settings page shows a 3×4 grid of the 12 months. Each cell displays the month name, its current background image (or a placeholder), and an edit button that opens `MonthImageModal` for that month.
- The app header gains a "Settings" link navigating to `/settings`.

### Storage

- Images are stored in the existing `./uploads/` directory on the backend.
- New GORM model `MonthSetting`:
  ```go
  type MonthSetting struct {
      Month     string    `json:"month" gorm:"primaryKey"` // "01"–"12"
      ImagePath string    `json:"image_path"`
      UpdatedAt time.Time `json:"updated_at"`
  }
  ```
- New backend endpoints:
  - `GET /api/settings/months` — returns all 12 month settings (returns empty `image_path` for unset months)
  - `PUT /api/settings/months/:month` — multipart/form-data, same pattern as event image upload. Replaces old image file before saving new one.
- New frontend hook `useMonthSettings` — fetches all month settings on mount, exposes `updateMonthImage(month, file)`.

### Route setup

React Router v6 is installed (`npm install react-router-dom`) and added to the project:
- `/` → existing `App` calendar view (wrapped in layout with shared header)
- `/settings` → `SettingsPage`

The shared layout renders the app header (with the new Settings link) and a `<Outlet />`.

---

## Feature 2 — Animated Event Bubbles

### Visual behavior

- Each event in a day cell is rendered as a circular bubble (≈ 24px diameter).
- Bubble color = the event's `color` field (same as current pill).
- If the event has an `image_path`, the bubble uses it as a `background-image` (cover).
- On hover, a tooltip shows the event title (and time if not all-day).
- Clicking a bubble opens the existing `EventModal` in edit mode for that event.

### Layout inside the cell

- Bubbles are positioned using a small pre-defined layout pattern (not random) so they don't overlap and fit predictably in the cell. Up to 4 bubbles are shown.
- If a day has more than 4 events, the 5th slot shows a count bubble (`+N`) in a neutral gray. Clicking it triggers `onDayClick` to open the create modal (same as clicking the cell background).
- The day number remains in the top-left corner, unchanged.

### Animation

Pure CSS `@keyframes` — no JS animation libraries.

```css
@keyframes bubble-float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-3px) scale(1.07); }
}
```

- Each bubble gets `animation: bubble-float <duration> ease-in-out infinite`.
- Duration varies per bubble index (2.2s, 2.8s, 3.1s, 2.5s) so they don't move in sync.
- The animation only runs on days with events — cells with no events have no animation overhead.

---

## Components affected / created

| Component | Change |
|---|---|
| `backend/models/month_setting.go` | New model |
| `backend/handlers/settings.go` | New handler (`GetMonthSettings`, `UpdateMonthSetting`) with `RegisterRoutes(rg *gin.RouterGroup)` |
| `backend/routes/routes.go` | New package — single `Register(r *gin.Engine)` that mounts all route groups (`/api/events`, `/api/settings/months`, etc.) |
| `backend/main.go` | Replace inline route registration with `routes.Register(r)` |
| `frontend/src/hooks/useMonthSettings.ts` | New hook |
| `frontend/src/api/settings.ts` | New API calls |
| `frontend/src/components/Calendar/CalendarGrid.tsx` | Add edit icon to header, apply background image |
| `frontend/src/components/Calendar/CalendarDay.tsx` | Replace pills with bubble layout |
| `frontend/src/components/MonthImageModal/MonthImageModal.tsx` | New modal |
| `frontend/src/pages/SettingsPage.tsx` | New page |
| `frontend/src/App.tsx` | Add React Router, layout, routes |
| `frontend/src/index.css` | Add `bubble-float` keyframes |

---

## Out of scope

- Mobile-optimized view (deferred explicitly)
- Per-year-month images (same image reused every year for a given month)
- Image cropping or resizing on upload

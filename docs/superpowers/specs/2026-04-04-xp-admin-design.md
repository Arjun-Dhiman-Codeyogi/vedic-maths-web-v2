# Design: XP Points System + Admin Dashboard

**Date:** 2026-04-04
**Project:** vedic-maths-web (React + Vite + TypeScript + Supabase)

---

## Feature 1: XP Points Per Correct Answer

### Goal
Award XP to users immediately on each correct answer in PracticePage, saved to their profile in Supabase.

### XP Rules
- Easy difficulty: 1 XP per correct answer
- Medium difficulty: 2 XP per correct answer
- Hard difficulty: 3 XP per correct answer

### Changes
- **`PracticePage.tsx`**: Call `addXP(xpAmount)` inside the answer-check handler when `isCorrect === true`, based on current `difficulty` state.
- Remove the existing game-end score-based `addXP(score)` call to avoid double-counting.
- `updateAccuracy(isCorrect)` stays unchanged.

### No changes needed
- `GameContext.tsx`: `addXP()` already handles level-up logic and saves to Supabase (debounced 1s).
- `ProfilePage.tsx`: XP bar already reads from `student.xp` / `student.xpToNext` — displays correctly.
- `student_progress` table: already has `xp`, `level`, `xp_to_next` columns.

---

## Feature 2: Admin Dashboard

### Goal
A protected `/admin` route showing all users with their stats and activity. Only accessible to the hardcoded admin email.

### Access Control
- Hardcoded admin email: `weareallforyou12345@gmail.com`
- On `/admin` route load: check `supabase.auth.getUser()` — if email doesn't match, redirect to `/`
- No separate password — uses existing Supabase auth session

### Database Changes

#### New Table: `user_activity_log`
```sql
CREATE TABLE user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,  -- 'page_visit' | 'practice_category'
  activity_value TEXT NOT NULL, -- 'learn' | 'videos' | 'practice' | 'vedic' | 'finger' | 'brain' | etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can insert their own rows, admin can read all
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all activity"
  ON user_activity_log FOR SELECT
  USING (true);  -- admin-only route enforced at frontend level
```

#### `profiles` table
No schema change needed. Admin will query all rows using service key or admin-level policy.

Add RLS policy so admin email can read all profiles:
```sql
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (true);
```

### Activity Tracking (Frontend)

**Page visits** — `AppLayout.tsx`:
- Listen to React Router location changes via `useLocation()`
- On each route change, if user is logged in, insert a `page_visit` row into `user_activity_log`
- Track: `learn`, `practice`, `videos`, `abacus`, `solver`, `sutras`, `profile`, `dashboard`

**Practice categories** — `PracticePage.tsx`:
- When user selects a category (vedic/finger/brain), insert a `practice_category` row
- `activity_value`: `'vedic'`, `'finger'`, or `'brain'`

### New File: `src/pages/AdminPage.tsx`

**Route:** `/admin` added to `App.tsx`

**Layout:**

1. **Top Stats Bar**
   - Total registered users
   - Active today (last_active_at = today)
   - Active this week

2. **User Cards Grid** (`grid-cols-2` on mobile, `grid-cols-3` on desktop)
   - Each card shows: avatar icon, display name, level, XP, last active (relative), joined date
   - "View Details" button opens a Sheet/Modal

3. **Detail Sheet** (opens on card click, uses Shadcn `Sheet` component)
   - Header: name, level, XP, streak
   - Section: Joined date, Last active, Total problems, Accuracy
   - Section: Pages Visited — horizontal bar chart (page name + visit count)
   - Section: Practice Categories — bar chart (category name + use count)

### Data Fetching (AdminPage)
- Fetch all `profiles` rows
- Fetch all `student_progress` rows
- Fetch all `user_activity_log` rows, grouped by `user_id`
- Join by `user_id` in JS to build per-user data object
- All fetched once on mount (no real-time needed)

### New Route in `App.tsx`
```tsx
import AdminPage from "./pages/AdminPage";
// ...
<Route path="/admin" element={<AdminPage />} />
// Outside AppLayout (no bottom nav shown)
```

---

## File Change Summary

| File | Change |
|------|--------|
| `src/pages/PracticePage.tsx` | Award XP per correct answer by difficulty; remove game-end XP |
| `src/components/AppLayout.tsx` | Track page visits on route change |
| `src/pages/AdminPage.tsx` | New file — admin dashboard |
| `src/App.tsx` | Add `/admin` route |
| `src/integrations/supabase/types.ts` | Add `user_activity_log` table types |
| Supabase SQL | Create `user_activity_log` table + RLS policies |

---

## Out of Scope
- Email notifications to admin
- Real-time user activity updates
- Admin ability to edit/delete user data
- XP awards in SolverPage or other pages (only PracticePage + DailyBrainTeaser)

# TaskFlow AI

A modern, full-stack Kanban task manager built with React, TanStack Start, Tailwind CSS, and Lovable Cloud (managed Postgres + Auth).

## Features

- Email/password authentication with protected routes
- Kanban board with drag-and-drop across **Todo / In Progress / Done**
- Create / edit / delete tasks (with confirmation modal)
- Task fields: title, description, priority (low/medium/high), due date, stage
- Search + priority filters
- Analytics dashboard: totals, completion rate, recent activity, overdue highlights
- Dark/light theme toggle with glassmorphism cards
- Toast notifications, skeleton loaders, empty states, error handling
- Fully responsive (mobile, tablet, desktop)

## Tech stack

- **Frontend:** React 19, TanStack Start (file-based routing), TanStack Query, Tailwind CSS v4, shadcn/ui, @dnd-kit, Zod, Sonner
- **Backend:** Lovable Cloud (managed Postgres + Auth + edge functions). The same primitives you'd get from Express + MongoDB + JWT are provided out of the box — authentication, row-level security, and a typed data API.

## Data model

- `profiles` — `id, name, email, created_at, updated_at` (auto-created on signup)
- `tasks` — `id, user_id, title, description, priority, due_date, stage, position, created_at, updated_at`

Row-Level Security ensures every user only sees and mutates their own data.

## Local development

```bash
bun install
bun dev
```

Environment variables (already wired in this project):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

## Equivalent REST endpoints

The original brief asked for an Express API. Lovable Cloud provides the same surface via its auto-generated REST layer (PostgREST) and Auth API:

| Brief endpoint | Lovable Cloud equivalent |
| --- | --- |
| `POST /api/auth/register` | `supabase.auth.signUp` |
| `POST /api/auth/login` | `supabase.auth.signInWithPassword` |
| `GET /api/auth/profile` | `supabase.from('profiles').select().eq('id', user.id)` |
| `GET /api/tasks` | `supabase.from('tasks').select()` |
| `POST /api/tasks` | `supabase.from('tasks').insert(...)` |
| `PUT /api/tasks/:id` | `supabase.from('tasks').update(...).eq('id', id)` |
| `DELETE /api/tasks/:id` | `supabase.from('tasks').delete().eq('id', id)` |
| `PATCH /api/tasks/:id/stage` | `supabase.from('tasks').update({ stage }).eq('id', id)` |

## Deployment

Click **Publish** in Lovable. The frontend deploys to Lovable's CDN and the backend runs on the connected Lovable Cloud project — no Render / Vercel configuration needed.

## Decisions & tradeoffs

- **Chose Lovable Cloud over Express+MongoDB.** Same feature set (JWT auth, REST, owned data) with RLS-enforced security and zero ops. Schemas/migrations live in `supabase/migrations`.
- **TanStack Start** instead of Vite + React Router — file-based routing with SSR-ready primitives.
- **@dnd-kit** for accessible drag-and-drop with optimistic updates via TanStack Query.
- **Zod** validates every form before hitting the API.
- **No password reset UI yet** — easy add via `supabase.auth.resetPasswordForEmail` + a `/reset-password` route.

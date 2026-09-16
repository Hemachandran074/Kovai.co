# Task Manager

A minimal personal task tracking app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (Postgres + Row Level Security) |
| Hosting | Vercel |

---

## Features

- **Google Sign-In** — one-click authentication via Supabase Auth
- **Create tasks** — add a task with a title; it starts as "Planned"
- **View your tasks** — only your own tasks, most recent first
- **Update status** — Planned → In Progress → Complete via a dropdown badge
- **Per-user isolation** — enforced at the database level with RLS; no task is ever visible to another user

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Hemachandran074/Kovai.co.git
cd Kovai.co
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://<supabase-project>.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the Supabase database

Run the following SQL once in the [Supabase SQL editor](https://supabase.com/dashboard/project/unfyrbuhyzcaepgoapnv/sql/new):

```sql
create table if not exists tasks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  title      text        not null,
  status     text        not null default 'Planned'
               check (status in ('Planned', 'In Progress', 'Complete')),
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Users can select own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);
```

### 4. Configure OAuth redirect URL

In **Supabase → Authentication → URL Configuration**, add:

- `http://localhost:5173` (local development)
- Your Vercel production URL (after deploy)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
src/
├── supabaseClient.ts       # Single Supabase client instance
├── App.tsx                 # Session state + task fetching
├── index.css               # Tailwind v4 + design tokens
└── components/
    ├── Auth.tsx            # Sign-in screen
    ├── TaskForm.tsx        # Task creation
    ├── TaskList.tsx        # Task list + empty state
    └── TaskItem.tsx        # Task card + status dropdown
```

---

## Deployment

```bash
npm run build   # produces dist/
```

Deploy the `dist/` folder to [Vercel](https://vercel.com). Set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in the Vercel project settings, then add the production URL to Supabase's allowed redirect URLs.

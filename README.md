# Task Manager

A modern, responsive personal task tracking Kanban application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

Developed for the **Kovai.co Graduate Support Engineer Trainee Assessment**.

---

## Table of Contents
1. [Application Overview & Architecture](#application-overview--architecture)
2. [User Documentation](#user-documentation)
   - [1. How to Access and Use the Application](#1-how-to-access-and-use-the-application)
   - [2. Login Instructions](#2-login-instructions)
   - [3. Important Assumptions Made](#3-important-assumptions-made)
   - [4. Known Limitations](#4-known-limitations)
   - [5. Important Notes & Warnings for Users](#5-important-notes--warnings-for-users)
3. [Developer & Setup Instructions](#developer--setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone Repository & Install Dependencies](#step-1-clone-repository--install-dependencies)
   - [Step 2: Environment Variables](#step-2-environment-variables)
   - [Step 3: Database & Security Schema Setup (Supabase)](#step-3-database--security-schema-setup-supabase)
   - [Step 4: Configure OAuth & Redirect URLs](#step-4-configure-oauth--redirect-urls)
   - [Step 5: Run the Development Server](#step-5-run-the-development-server)
   - [Step 6: Build for Production & Deployment](#step-6-build-for-production--deployment)
4. [Project Structure](#project-structure)
5. [AI Assistance & Tooling Disclosure](#ai-assistance--tooling-disclosure)

---

## Application Overview & Architecture

Task Manager is designed according to the **Kinetic Slate** design system. It allows users to authenticate via Google OAuth and seamlessly manage their daily tasks across three distinct stages: **Planned**, **In Progress**, and **Complete**.

### Key Tech Stack
- **Frontend Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Custom Kinetic Slate Design Tokens
- **Backend & Auth**: Supabase (PostgreSQL with Row-Level Security)
- **State & Activity**: React State + Local Storage Activity Stream

---

## User Documentation

### 1. How to Access and Use the Application

#### Accessing the App
- **Local URL**: `http://localhost:5173` (or `http://localhost:5174` depending on local port allocation)
- **Production URL**: Deployed on Vercel (see deployment section or your live environment link)

#### Using the Dashboard
Once logged in, you are presented with the main workspace comprising:
- **Header Bar**: Displays the application branding ("Task Manager"), your user profile indicator, and the **Sign Out** button.
- **Kanban Board**: Three organized workflow columns:
  - 🟣 **Planned**: Tasks that are queued or pending start.
  - 🟠 **In Progress**: Tasks actively being worked on (features an active pulsating status indicator).
  - 🟢 **Complete**: Tasks that have been finished.
- **Recent Activity Panel (Right Sidebar)**: A real-time timeline that logs and displays your last 5 actions (creating a task, updating status, or deleting a task) with action badges and timestamps.

#### Managing Tasks
1. **Creating a Task**:
   - Locate the "+ Add task" card or the inline input field at the top of the **Planned** column (or any other column).
   - Enter your task title (e.g., `Review customer support logs`) and click **Add** or press **Enter**.
   - The task will immediately appear at the top of that column.
2. **Changing Task Status**:
   - Each task card contains an interactive status dropdown badge.
   - Click the badge to move the task between `Planned`, `In Progress`, and `Complete`.
   - The card transitions immediately to the target column, and the action is recorded in the Recent Activity feed.
3. **Deleting a Task**:
   - Hover over or view any task card to reveal the **Trash / Delete** button.
   - Clicking delete permanently removes the task from your database and logs the deletion to your activity history.
4. **Signing Out**:
   - Click the **Sign out** button located in the top-right header to securely clear your session.

---

### 2. Login Instructions

The application uses **Google OAuth** powered by Supabase Auth for one-click authentication.

1. **Navigate to the Application**:
   - Open your web browser and navigate to the application URL.
   - If not authenticated, you will be redirected to the sign-in screen.
2. **Initiate Sign-In**:
   - Click the **"Sign in with Google"** button on the welcome card.
3. **Authenticate with Google**:
   - A Google authentication window/prompt will open.
   - Select your desired Google account and approve the read permissions.
4. **Automatic Redirection**:
   - Upon successful verification, Google redirects you back through Supabase to the Task Manager dashboard.
   - Your session token is stored securely in the browser's session storage/cookies.
   - Automatic account creation occurs on first login—no manual registration or password creation required.

---

### 3. Important Assumptions Made

1. **Single-User Workspace per Account**:
   - Each user has their own private task board. Tasks cannot be shared, assigned to others, or made public.
2. **Google Account Availability**:
   - It is assumed that all end users have access to a valid Google account for authentication. Email/password authentication is intentionally disabled in favor of seamless OAuth.
3. **Network Connectivity**:
   - The app operates as a cloud-connected client. Real-time operations (create, update, delete) assume an active internet connection to communicate with the Supabase Postgres API.
4. **Recent Activity Scope**:
   - The Recent Activity feed is optimized for fast client-side performance and session continuity, persisting the last 20 events per user in `localStorage` and rendering the 5 most recent events.
5. **Simplicity of Task Model**:
   - Following assessment requirements, tasks are modeled around concise titles and workflow states without complex attachments, markdown bodies, or subtasks.

---

### 4. Known Limitations

- **No Offline Mode**: If the device loses internet access, database mutations (add/move/delete) cannot sync and will prompt an error.
- **Local Activity Log Sync Across Devices**: The Recent Activity feed is tied to the browser's `localStorage`. While your tasks are synced globally across all devices via PostgreSQL, the recent activity timeline is device/browser-specific.
- **No Drag-and-Drop Reordering**: Tasks are ordered chronologically (`created_at desc`) within columns, and status transitions occur via the dropdown badge rather than drag-and-drop.
- **Fixed Workflow States**: The columns (`Planned`, `In Progress`, `Complete`) are fixed; custom columns or board customization are not currently supported.
- **No Undo/Trash Recovery**: Deleting a task deletes it immediately from the database without a temporary holding bin or undo timer.

---

### 5. Important Notes & Warnings for Users

> [!WARNING]
> **Task Deletion is Permanent**:
> When you click the delete icon on a task card, it is immediately removed from the database via Postgres cascade delete. Ensure you no longer need the task before deleting.

> [!NOTE]
> **Data Privacy & Row-Level Security (RLS)**:
> Your tasks are protected by database-level Row Level Security policies. Even if someone inspects the network traffic or API keys, they can **never** read, edit, or delete tasks belonging to another user.

> [!IMPORTANT]
> **Browser Privacy & Cookies**:
> If you are using Incognito mode or third-party cookie blockers, closing the window will clear your local storage and session tokens, requiring you to sign in again upon next visit.

---

## Developer & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Supabase Account**: Free tier project on [supabase.com](https://supabase.com)
- **Google Cloud Console**: OAuth credentials configured in Supabase

---

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/Hemachandran074/Kovai.co.git
cd Kovai.co
npm install
```

---

### Step 2: Environment Variables

Create a `.env.local` file in the project root directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

*(Note: Replace with your actual Supabase URL and anon public key from Supabase Dashboard → Settings → API).*

---

### Step 3: Database & Security Schema Setup (Supabase)

Navigate to your **Supabase Dashboard → SQL Editor** and execute the following SQL script to create the table, constraints, and Row-Level Security (RLS) policies:

```sql
-- 1. Create tasks table
create table if not exists tasks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  title      text        not null,
  status     text        not null default 'Planned'
               check (status in ('Planned', 'In Progress', 'Complete')),
  created_at timestamptz not null default now()
);

-- 2. Enable Row-Level Security
alter table tasks enable row level security;

-- 3. RLS Policies: Ensure users can only interact with their own tasks
create policy "Users can select own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- 4. Create performance index on user_id and created_at
create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_created_at on tasks(created_at desc);
```

---

### Step 4: Configure OAuth & Redirect URLs

1. In **Supabase Dashboard → Authentication → Providers → Google**:
   - Enable Google provider.
   - Enter your `Client ID` and `Client Secret` from Google Cloud Console.
2. In **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (or production URL)
   - **Redirect URLs**:
     - `http://localhost:5173`
     - `http://localhost:5174`
     - `https://kovai-co-task-management-app.vercel.app/`

---

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 6: Build for Production & Deployment

Build the production bundle:

```bash
npm run build
```

This compiles your application into the `dist/` directory.

#### Deploying to Vercel:
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy and copy your production domain.
5. Add your production domain to the Supabase Allowed Redirect URLs.

---

## Project Structure

```
Kovai.co/
├── context/                   # Assessment requirements & design context
│   ├── DESIGN.md              # Kinetic Slate design token specifications
│   ├── project-overview.md    # Scope & objectives
│   └── code-standards.md      # Coding style & constraints
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Google OAuth sign-in screen
│   │   ├── KanbanColumn.tsx   # Kanban column container with quick-add
│   │   ├── TaskCard.tsx       # Interactive card with status dropdown & delete
│   │   ├── RecentActivity.tsx # Right sidebar with real-time 5-event timeline
│   │   ├── TaskItem.tsx       # Shared status types & color constants
│   │   ├── TaskForm.tsx       # Standalone task creation form
│   │   └── TaskList.tsx       # Task list renderer
│   ├── lib/
│   │   └── activityLog.ts     # LocalStorage activity manager (max 20 entries)
│   ├── supabaseClient.ts      # Initialized Supabase client instance
│   ├── App.tsx                # Session management & board orchestration
│   ├── main.tsx               # React application entrypoint
│   └── index.css              # Tailwind CSS v4 setup & theme definitions
├── AI_USAGE_AND_FEATURES.md   # AI tooling disclosure & feature breakdown
├── README.md                  # Complete user & developer documentation
├── package.json
└── vite.config.ts
```

---

## AI Assistance & Tooling Disclosure

In accordance with academic and assessment integrity guidelines:
- **Claude (Anthropic)** was used during the initial stage for architectural planning, requirements decomposition, and design token interpretation.
- **Antigravity Coding Agent (Google DeepMind)** was used for iterative component implementation, Tailwind v4 setup, state orchestration, bug fixing, and documentation generation.

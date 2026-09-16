import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { Auth } from './components/Auth'
import { KanbanColumn } from './components/KanbanColumn'
import { RecentActivity } from './components/RecentActivity'
import { STATUSES } from './components/TaskItem'
import type { Task, Status } from './components/TaskItem'
import { getActivities, appendActivity } from './lib/activityLog'
import type { ActivityEntry, ActivityType } from './lib/activityLog'

/*
 * DESIGN.md layout rules:
 *   Desktop: fixed left sidebar (240–280px) + flexible canvas with gutter-lg (1.5rem).
 *   Canvas Base: #F8FAFC (Level 0 — no shadow, no border).
 *   Header: Level 1 card surface (#FFFFFF, 1px #E2E8F0 border-bottom).
 *   Board columns: Level 0 wells inside a Level 1 container card.
 *
 * Typography roles used:
 *   headline-xl  (32px 700 -0.025em Plus Jakarta Sans) — board title
 *   headline-md  (18px 600 -0.015em Plus Jakarta Sans) — app name in header
 *   body-md      (14px 400 -0.006em Inter) — metadata, nav links
 *   label-sm     (11px 600  0.02em Inter)  — uppercase label-sm accents
 */

export default function App() {
  const [session,    setSession]    = useState<Session | null | undefined>(undefined)
  const [tasks,      setTasks]      = useState<Task[]>([])
  const [activities, setActivities] = useState<ActivityEntry[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setTasks([]); setActivities([]); return }
    fetchTasks()
    setActivities(getActivities(session.user.id))
  }, [session])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
    if (error) console.error('Failed to fetch tasks:', error.message)
    else setTasks((data as Task[]) ?? [])
  }

  function logActivity(type: ActivityType, taskTitle: string, newStatus?: string) {
    if (!session) return
    const updated = appendActivity(session.user.id, { type, taskTitle, newStatus })
    setActivities(updated)
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign-out error:', error.message)
  }

  /* ── Loading gate: never render task list before session resolves ── */
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div
          className="ks-spinner"
          style={{
            width: '24px', height: '24px',
            border: '2px solid #e0e7ff',
            borderTopColor: '#4f46e5',
            borderRadius: '9999px',
          }}
        />
      </div>
    )
  }

  if (!session) return <Auth />

  /* Group tasks by status for the three kanban columns */
  const grouped = STATUSES.reduce<Record<Status, Task[]>>((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {} as Record<Status, Task[]>)

  const userInitial = session.user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    /* Canvas Base — Level 0: #F8FAFC, no shadow */
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ══ App Header ═══════════════════════════════════════════════════════
          Level 1: #FFFFFF bg + 1px #E2E8F0 border-bottom + subtle shadow.
          DESIGN.md §Inputs — search field: #FFFFFF bg, 1px #E2E8F0 border,
          focus ring 0 0 0 2px rgba(79,70,229,0.15) with #4F46E5 solid edge.
      ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04)',
        }}
      >
        <div
          className="flex items-center justify-between gap-6"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '56px' }}
        >
          {/* ── Logo ── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex items-center justify-center rounded-lg text-white font-bold"
              style={{
                width: '32px', height: '32px',
                background: '#4f46e5',   /* primary-container */
                fontSize: '14px', fontWeight: '700',
              }}
            >
              T
            </div>
            {/* headline-md: Plus Jakarta Sans 18px 600 */}
            <span
              className="font-display"
              style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: '22px' }}
            >
              Task Manager
            </span>
          </div>

          {/* ── Nav + user ── */}
          <div className="flex items-center gap-1">
            {/* Ghost nav links — body-md */}
            <nav className="hidden sm:flex items-center">
              {/* "Tasks" — active, primary colour */}
              <span
                className="rounded-md flex items-center"
                style={{
                  height: '32px', padding: '0 12px',
                  fontSize: '14px', fontWeight: '500', letterSpacing: '-0.006em',
                  color: '#4f46e5', cursor: 'default',
                }}
              >
                Tasks
              </span>
            </nav>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' }} />

            {/* User avatar */}
            <div
              className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
              style={{
                width: '28px', height: '28px',
                background: '#4f46e5',
                fontSize: '12px', fontWeight: '600',
              }}
              title={session.user.email}
            >
              {userInitial}
            </div>

            {/* Ghost sign-out button — DESIGN.md §Buttons Ghost */}
            <button
              id="sign-out-btn"
              type="button"
              onClick={handleSignOut}
              className="rounded-md transition-colors duration-150"
              style={{
                height: '32px', padding: '0 12px',
                fontSize: '13px', fontWeight: '500', letterSpacing: '-0.005em',
                color: '#64748b', background: 'transparent', border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ══ Main canvas ══════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Board header ── */}
        <div className="flex items-start justify-between" style={{ marginBottom: '24px' }}>
          <div>
            {/* headline-xl: Plus Jakarta Sans 32px 700 -0.025em */}
            <h1
              className="font-display"
              style={{ fontSize: '32px', fontWeight: '700', lineHeight: '40px', letterSpacing: '-0.025em', color: '#0f172a', margin: 0 }}
            >
              My Tasks
            </h1>
            {/* body-md metadata — Slate 500 */}
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', letterSpacing: '-0.006em', fontVariantNumeric: 'tabular-nums' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {/* Personal Board chip — label-sm */}
          <div
            className="flex items-center gap-2"
            style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '9999px', padding: '4px 12px',
              boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04)',
              marginTop: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#059669', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155', letterSpacing: '-0.005em' }}>
              Personal Board
            </span>
          </div>
        </div>

        {/* ══ Board + Activity sidebar ═══════════════════════════════════════ */}
        <div className="flex items-start" style={{ gap: '24px' }}>

          {/* ── Kanban columns (flex-1) ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}
            >
              {STATUSES.map(status => (
                <div
                  key={status}
                  className="rounded-xl bg-white"
                  style={{
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04)',
                  }}
                >
                  <KanbanColumn
                    status={status}
                    tasks={grouped[status]}
                    userId={session.user.id}
                    onRefresh={fetchTasks}
                    onActivity={logActivity}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Activity sidebar ── */}
          <RecentActivity activities={activities.slice(0, 5)} />

        </div>
      </main>
    </div>
  )
}

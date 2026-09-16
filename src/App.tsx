import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { Auth } from './components/Auth'
import { KanbanColumn } from './components/KanbanColumn'
import { STATUSES } from './components/TaskItem'
import type { Task, Status } from './components/TaskItem'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [tasks, setTasks] = useState<Task[]>([])

  // Resolve session once, then keep in sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // Fetch own tasks whenever session changes
  useEffect(() => {
    if (!session) { setTasks([]); return }
    fetchTasks()
  }, [session])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
    if (error) console.error('Failed to fetch tasks:', error.message)
    else setTasks((data as Task[]) ?? [])
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign-out error:', error.message)
  }

  // ── Loading gate ──
  if (session === undefined) {
    return (
      <div className="board-bg min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full spinner" />
      </div>
    )
  }

  // ── Signed out ──
  if (!session) return <Auth />

  // Group tasks by status for the three columns
  const grouped = STATUSES.reduce<Record<Status, Task[]>>((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s)
    return acc
  }, {} as Record<Status, Task[]>)

  return (
    <div className="board-bg min-h-screen">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-display font-bold text-slate-900 text-sm tracking-widest">
              TASK
            </span>
          </div>

          {/* Search (decorative — no scope for live search) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-400 min-w-52 cursor-default select-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Search everything
          </div>

          {/* Nav + user */}
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4">
              <span className="text-sm font-semibold text-pink-500 cursor-default">Tasks</span>
            </nav>

            {/* User avatar + sign out */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {session.user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                id="sign-out-btn"
                type="button"
                onClick={handleSignOut}
                className="text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-2.5 py-1 transition-colors hidden sm:block"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Board title row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
              My Tasks
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} across all columns
            </p>
          </div>
        </div>

        {/* ── Kanban columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-5 shadow-sm"
            >
              <KanbanColumn
                status={status}
                tasks={grouped[status]}
                userId={session.user.id}
                onRefresh={fetchTasks}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

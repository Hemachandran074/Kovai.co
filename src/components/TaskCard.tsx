import { supabase } from '../supabaseClient'
import { STATUSES } from './TaskItem'
import type { Task, Status } from './TaskItem'

// Kinetic Slate status badge styles (matching ui-context.md)
const BADGE: Record<Status, string> = {
  Planned:      'bg-indigo-50 text-indigo-600 border border-indigo-100',
  'In Progress':'bg-amber-50  text-amber-600  border border-amber-100',
  Complete:     'bg-emerald-50 text-emerald-600 border border-emerald-100',
}

interface Props {
  task: Task
  onStatusChanged: () => void
}

export function TaskCard({ task, onStatusChanged }: Props) {
  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Status
    if (!STATUSES.includes(next)) {
      console.error('Rejected invalid status:', next)
      return
    }
    const { error } = await supabase
      .from('tasks')
      .update({ status: next })
      .eq('id', task.id)

    if (error) console.error('Failed to update status:', error.message)
    else onStatusChanged()
  }

  const date = new Date(task.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      id={`task-${task.id}`}
      className="bg-white rounded-xl border border-slate-100 p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.09)] transition-shadow duration-200 group"
    >
      {/* Status badge — doubles as the status selector */}
      <div className="flex items-center justify-between mb-3">
        <select
          id={`status-select-${task.id}`}
          value={task.status}
          onChange={handleStatusChange}
          aria-label={`Status for "${task.title}"`}
          className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-colors ${BADGE[task.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Task title */}
      <p className="text-sm font-medium text-slate-800 leading-snug mb-4 line-clamp-3">
        {task.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {/* Calendar */}
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {date}
        </span>
      </div>
    </div>
  )
}

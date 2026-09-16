import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { TaskCard } from './TaskCard'
import type { Task, Status } from './TaskItem'

const DOT: Record<Status, string> = {
  Planned:      'bg-indigo-400',
  'In Progress':'bg-amber-400',
  Complete:     'bg-emerald-400',
}

const COUNT_BADGE: Record<Status, string> = {
  Planned:      'bg-indigo-50 text-indigo-600',
  'In Progress':'bg-amber-50 text-amber-600',
  Complete:     'bg-emerald-50 text-emerald-600',
}

interface Props {
  status: Status
  tasks: Task[]
  userId: string
  onRefresh: () => void
}

export function KanbanColumn({ status, tasks, userId, onRefresh }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return

    setLoading(true)
    setAddError(null)

    const { error } = await supabase.from('tasks').insert({
      title: trimmed,
      status,
      user_id: userId, // always from session — never from free input
    })

    if (error) {
      console.error('Failed to create task:', error.message)
      setAddError(error.message)
    } else {
      setTitle('')
      setIsAdding(false)
      onRefresh()
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setIsAdding(false); setTitle(''); setAddError(null) }
  }

  function handleCancel() {
    setIsAdding(false)
    setTitle('')
    setAddError(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[status]}`} />
          <h2 className="text-sm font-semibold text-slate-700">{status}</h2>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COUNT_BADGE[status]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 mb-4" />

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChanged={onRefresh} />
        ))}

        {/* Inline add card form */}
        {isAdding && (
          <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm ring-1 ring-indigo-100">
            <p className="text-xs font-medium text-slate-400 mb-2">New card</p>
            <input
              id={`new-task-input-${status}`}
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What is the task?"
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 border-none outline-none bg-transparent mb-3"
            />

            {/* Error message */}
            {addError && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                {addError}
              </p>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                id={`add-task-btn-${status}`}
                type="button"
                onClick={handleAdd}
                disabled={loading || !title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding…' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add card button */}
      {!isAdding && (
        <button
          id={`add-card-btn-${status}`}
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors duration-150 py-1 group"
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="text-slate-400 group-hover:text-slate-600 transition-colors"
            aria-hidden="true"
          >
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Card
        </button>
      )}
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../supabaseClient'

interface Props {
  userId: string
  onTaskCreated: () => void
}

export function TaskForm({ userId, onTaskCreated }: Props) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert({
      title: trimmed,
      status: 'Planned',
      user_id: userId, // always from the authenticated session, never from free input
    })

    if (error) {
      console.error('Failed to create task:', error.message)
    } else {
      setTitle('')
      onTaskCreated()
    }
    setLoading(false)
  }

  return (
    <form
      id="task-form"
      onSubmit={handleSubmit}
      className="flex gap-2 w-full"
      aria-label="Add a new task"
    >
      <input
        id="task-title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you need to do?"
        disabled={loading}
        className="flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-colors disabled:opacity-50"
      />
      <button
        id="task-submit-btn"
        type="submit"
        disabled={loading || !title.trim()}
        className="rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}

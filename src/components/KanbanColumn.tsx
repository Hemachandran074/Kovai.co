import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { TaskCard } from './TaskCard'
import type { Task, Status } from './TaskItem'
import type { ActivityType } from '../lib/activityLog'

/*
 * DESIGN.md column layout:
 *   Level 0: board column wells — flat #F8FAFC, no shadow, no border.
 *   Column header: headline-sm (Plus Jakarta Sans 15px 600) + tabular count badge.
 *   Compact density: 32px items, space-xs (4px) gap, space-sm (8px) padding.
 *   Standard density: 40px rows, space-sm (8px) gap, space-md (12px) h-padding.
 *
 * Status dot colors per DESIGN.md §Status Badges.
 * "In Progress" dot has animated pulse.
 */

type ColMeta = { dot: string; pulse: boolean; countBg: string; countText: string }
const COL: Record<Status, ColMeta> = {
  Planned:       { dot: '#4f46e5', pulse: false, countBg: '#eef2ff', countText: '#4338ca' },
  'In Progress': { dot: '#d97706', pulse: true,  countBg: '#fffbeb', countText: '#92400e' },
  Complete:      { dot: '#059669', pulse: false, countBg: '#ecfdf5', countText: '#065f46' },
}

interface Props {
  status: Status
  tasks: Task[]
  userId: string
  onRefresh: () => void
  onActivity: (type: ActivityType, taskTitle: string, newStatus?: string) => void
}

export function KanbanColumn({ status, tasks, userId, onRefresh, onActivity }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return
    setLoading(true)
    setAddError(null)

    const { error } = await supabase.from('tasks').insert({
      title: trimmed,
      status,
      user_id: userId, // always from session — never free input
    })

    if (error) {
      console.error('Failed to create task:', error.message)
      setAddError(error.message)
    } else {
      onActivity('created', trimmed)
      setTitle('')
      setIsAdding(false)
      onRefresh()
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  handleAdd()
    if (e.key === 'Escape') { setIsAdding(false); setTitle(''); setAddError(null) }
  }

  function handleCancel() { setIsAdding(false); setTitle(''); setAddError(null) }

  const meta = COL[status]

  return (
    /* Level 0: flat board column well, #F8FAFC canvas, no shadow */
    <div className="flex flex-col h-full" style={{ background: '#f8fafc', minHeight: '200px' }}>

      {/* ── Column header ── */}
      <div className="flex items-center justify-between mb-4" style={{ padding: '0 0 0 0' }}>
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span
            className={meta.pulse ? 'ks-pulse' : ''}
            style={{
              display: 'inline-block',
              width: '8px', height: '8px',
              borderRadius: '9999px',
              background: meta.dot,
              flexShrink: 0,
            }}
          />
          {/* headline-sm: Plus Jakarta Sans 15px 600 -0.01em */}
          <h2
            className="font-display"
            style={{ fontSize: '15px', fontWeight: '600', lineHeight: '22px', letterSpacing: '-0.01em', color: '#0f172a', margin: 0 }}
          >
            {status}
          </h2>
        </div>

        {/* Count badge — label-sm: 11px 600 0.02em */}
        <span
          style={{
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.02em', lineHeight: '14px',
            background: meta.countBg, color: meta.countText,
            borderRadius: '9999px', padding: '3px 8px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Hairline divider — Slate 100 internal divider */}
      <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

      {/* ── Cards — standard density: space-sm (8px) gap ── */}
      <div className="flex flex-col flex-1" style={{ gap: '8px' }}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onStatusChanged={onRefresh} onActivity={onActivity} />
        ))}

        {/* ── Inline "Create New Card" form (DESIGN.md §Task Cards style) ── */}
        {isAdding && (
          <div
            className="rounded-xl bg-white"
            style={{
              border: '1px solid #4f46e5',   /* primary-container focus accent */
              padding: '12px 14px',
              boxShadow: '0 0 0 2px rgba(79,70,229,0.12), 0 1px 2px 0 rgba(15,23,42,0.04)',
            }}
          >
            {/* label-md */}
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px', letterSpacing: '-0.005em' }}>
              New card
            </p>
            <input
              id={`new-task-input-${status}`}
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What is the task?"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
                letterSpacing: '-0.006em',
                lineHeight: '20px',
                marginBottom: '12px',
              }}
            />

            {/* Error chip */}
            {addError && (
              <p
                style={{
                  fontSize: '13px', color: '#ba1a1a',
                  background: '#ffdad6', border: '1px solid #fca5a5',
                  borderRadius: '6px', padding: '6px 10px',
                  marginBottom: '10px', lineHeight: '18px',
                }}
              >
                {addError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              {/* Ghost button */}
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  height: '32px', padding: '0 12px',
                  fontSize: '13px', fontWeight: '500', color: '#64748b',
                  background: 'transparent', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', letterSpacing: '-0.005em',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
              >
                Cancel
              </button>

              {/* Primary button */}
              <button
                id={`add-task-btn-${status}`}
                type="button"
                onClick={handleAdd}
                disabled={loading || !title.trim()}
                style={{
                  height: '32px', padding: '0 12px',
                  fontSize: '13px', fontWeight: '500', letterSpacing: '-0.005em',
                  color: '#ffffff',
                  background: loading || !title.trim() ? '#94a3b8' : '#0f172a',
                  border: 'none', borderRadius: '6px',
                  cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!loading && title.trim()) e.currentTarget.style.background = '#1e293b' }}
                onMouseLeave={e => { if (!loading && title.trim()) e.currentTarget.style.background = '#0f172a' }}
              >
                {loading ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── "+ Add Card" ghost button ── */}
      {!isAdding && (
        <button
          id={`add-card-btn-${status}`}
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 transition-colors duration-150 group"
          style={{
            marginTop: '12px',
            height: '32px', padding: '0 8px',
            fontSize: '13px', fontWeight: '500', letterSpacing: '-0.005em',
            color: '#64748b', background: 'transparent', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Add Card
        </button>
      )}
    </div>
  )
}

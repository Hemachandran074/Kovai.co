import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { STATUSES } from './TaskItem'
import type { Task, Status } from './TaskItem'
import type { ActivityType } from '../lib/activityLog'

/*
 * DESIGN.md §Task Cards:
 *   rounded-xl (12px), #FFFFFF bg, #E2E8F0 hairline border, 12–14px padding.
 *   Level 1 shadow at rest → Level 2 shadow on hover.
 *   Status badge: compact pill, 20px height, 8px h-padding, label-sm font.
 * DESIGN.md §Status Badges:
 *   Planned:    #EEF2FF bg / #4338CA text / #C7D2FE border + indigo dot
 *   In Progress:#FFFBEB bg / #92400E text / #FDE68A border + pulsing amber dot
 *   Complete:   #ECFDF5 bg / #065F46 text / #A7F3D0 border + emerald dot
 */

type BadgeMeta = {
  bg: string; text: string; border: string; dot: string; pulse: boolean
}
const BADGE: Record<Status, BadgeMeta> = {
  Planned:       { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', dot: '#4f46e5', pulse: false },
  'In Progress': { bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#d97706', pulse: true  },
  Complete:      { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', dot: '#059669', pulse: false },
}

interface Props {
  task: Task
  onStatusChanged: () => void
  onActivity: (type: ActivityType, taskTitle: string, newStatus?: string) => void
}

export function TaskCard({ task, onStatusChanged, onActivity }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Status
    if (!STATUSES.includes(next)) { console.error('Rejected invalid status:', next); return }

    const { error } = await supabase
      .from('tasks')
      .update({ status: next })
      .eq('id', task.id)

    if (error) console.error('Failed to update status:', error.message)
    else {
      onActivity('status_updated', task.title, next)
      onStatusChanged()
    }
  }

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)

    if (error) {
      console.error('Failed to delete task:', error.message)
      setDeleting(false)
    } else {
      onActivity('deleted', task.title)
      onStatusChanged() // triggers parent refresh
    }
  }

  const badge = BADGE[task.status]

  /* body-sm date — Inter 13px, Slate 500 */
  const date = new Date(task.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  /* Compact task ID in code-sm (first 8 chars of UUID) */
  const taskKey = task.id.slice(0, 8).toUpperCase()

  return (
    <div
      id={`task-${task.id}`}
      className="rounded-xl bg-white group transition-all duration-200 cursor-default"
      style={{
        border: '1px solid #e2e8f0',
        padding: '12px 14px',
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.15s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        if (deleting) return
        e.currentTarget.style.boxShadow =
          '0 4px 6px -1px rgba(15,23,42,0.06), 0 2px 4px -2px rgba(15,23,42,0.04)'
        e.currentTarget.style.borderColor = '#cbd5e1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(15, 23, 42, 0.04)'
        e.currentTarget.style.borderColor = '#e2e8f0'
      }}
    >
      {/* ── Status badge (pill select) ── */}
      <div className="flex items-center justify-between mb-3">
        {/* code-sm task key: JetBrains Mono 12px Slate 500 */}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '500', color: '#64748b', letterSpacing: '0em' }}>
          {taskKey}
        </span>

        {/* Status pill — doubles as select for status update */}
        <div className="relative flex items-center">
          {/* Dot indicator */}
          <span
            className={badge.pulse ? 'ks-pulse' : ''}
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '9999px',
              background: badge.dot,
              marginRight: '5px',
              flexShrink: 0,
            }}
          />
          <select
            id={`status-select-${task.id}`}
            value={task.status}
            onChange={handleStatusChange}
            aria-label={`Status for "${task.title}"`}
            style={{
              appearance: 'none',
              background: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              borderRadius: '9999px',
              /* label-sm: Inter 11px 600 0.02em */
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.02em',
              lineHeight: '14px',
              padding: '3px 8px',
              height: '20px',
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79,70,229,0.15)' }}
            onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Task title — body-md semi-bold #0F172A ── */}
      <p
        style={{
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '20px',
          letterSpacing: '-0.006em',
          color: '#0f172a',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {task.title}
      </p>

      {/* ── Meta row — body-sm Slate 500 ── */}
      <div className="flex items-center justify-between gap-3" style={{ fontSize: '13px', color: '#64748b' }}>
        <span className="flex items-center gap-1">
          {/* Calendar icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{date}</span>
        </span>

        {/* Delete button — ghost, visible on card hover (DESIGN.md §Buttons Ghost) */}
        <button
          id={`delete-task-${task.id}`}
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded flex items-center justify-center"
          style={{
            width: '24px', height: '24px',
            border: 'none', background: 'transparent',
            color: '#94a3b8', cursor: deleting ? 'not-allowed' : 'pointer',
            padding: 0, flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1.75 3.5h10.5M5.25 3.5V2.333a.583.583 0 0 1 .583-.583h2.334a.583.583 0 0 1 .583.583V3.5M11.083 3.5l-.583 8.167H3.5L2.917 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

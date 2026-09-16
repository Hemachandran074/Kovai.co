import type { ActivityEntry } from '../lib/activityLog'

/*
 * Recent Activity panel — Kinetic Slate design.
 * Shows last 5 activity entries from the in-browser log.
 *
 * Elevation: Level 1 card (#FFFFFF, 1px #E2E8F0, shadow-1).
 * Icon circles: 36px, tinted bg matching Kinetic Slate status tokens.
 * Typography:
 *   headline-md  (18px 600) — panel title
 *   body-md      (14px 400) — activity description ("You" + bold action)
 *   label-sm     (11px 600 0.02em uppercase) — date/time
 */

/* Icon and colour per activity type / status */
type IconMeta = { bg: string; stroke: string; icon: 'plus' | 'check' | 'pencil' | 'trash' }

function getIconMeta(entry: ActivityEntry): IconMeta {
  if (entry.type === 'deleted')
    return { bg: '#fff1f2', stroke: '#e11d48', icon: 'trash' }

  if (entry.type === 'created')
    return { bg: '#eef2ff', stroke: '#4f46e5', icon: 'plus' }

  // status_updated
  if (entry.newStatus === 'Complete')
    return { bg: '#ecfdf5', stroke: '#059669', icon: 'check' }

  return { bg: '#fffbeb', stroke: '#d97706', icon: 'pencil' }
}

function Icon({ name, stroke }: { name: IconMeta['icon']; stroke: string }) {
  if (name === 'plus')
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3v10M3 8h10" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    )
  if (name === 'check')
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8l3.5 3.5L13 5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  if (name === 'pencil')
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    )
  // trash
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M5.333 4V2.667a.667.667 0 0 1 .667-.667h4a.667.667 0 0 1 .667.667V4M12.667 4l-.667 9.333H4L3.333 4" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function activityLabel(entry: ActivityEntry): { prefix: string; action: string } {
  const short = entry.taskTitle.length > 28
    ? entry.taskTitle.slice(0, 28) + '…'
    : entry.taskTitle

  if (entry.type === 'created')
    return { prefix: 'You created', action: `"${short}"` }

  if (entry.type === 'deleted')
    return { prefix: 'You deleted', action: `"${short}"` }

  // status_updated
  if (entry.newStatus === 'Complete')
    return { prefix: 'You marked', action: `"${short}" complete` }

  return { prefix: 'You updated', action: `"${short}" to ${entry.newStatus}` }
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  activities: ActivityEntry[]
}

export function RecentActivity({ activities }: Props) {
  return (
    /* Level 1 card */
    <aside
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 2px 0 rgba(15,23,42,0.04)',
        padding: '20px',
        width: '280px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '72px',          /* clears the 56px header + 16px gap */
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        {/* headline-sm: Plus Jakarta Sans 15px 600 */}
        <h2
          className="font-display"
          style={{ fontSize: '15px', fontWeight: '600', lineHeight: '22px', letterSpacing: '-0.01em', color: '#0f172a', margin: 0 }}
        >
          Recent Activity
        </h2>
        {/* Kebab menu — decorative */}
        <button
          type="button"
          aria-label="Activity options"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: '2px 4px', borderRadius: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
          </svg>
        </button>
      </div>

      {/* Hairline divider */}
      <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '16px' }} />

      {/* Activity items */}
      {activities.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px 0', letterSpacing: '-0.005em' }}>
          No activity yet — add a task to get started.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activities.map(entry => {
            const meta = getIconMeta(entry)
            const { prefix, action } = activityLabel(entry)
            return (
              <li key={entry.id} className="flex items-start gap-3">
                {/* Coloured icon circle */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: '34px', height: '34px', borderRadius: '9999px',
                    background: meta.bg, flexShrink: 0,
                  }}
                >
                  <Icon name={meta.icon} stroke={meta.stroke} />
                </div>

                {/* Text */}
                <div style={{ minWidth: 0 }}>
                  {/* body-md: "You" normal + action bold */}
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '18px', color: '#334155', letterSpacing: '-0.005em' }}>
                    <span style={{ fontWeight: '400' }}>{prefix} </span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{action}</span>
                  </p>
                  {/* label-sm date */}
                  <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.02em', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

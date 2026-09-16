/*
 * Lightweight in-browser activity log.
 * Persisted in localStorage per user so it survives page reloads.
 * Max 20 entries stored; UI shows the most recent 5.
 */

export type ActivityType = 'created' | 'status_updated' | 'deleted'

export interface ActivityEntry {
  id: string
  type: ActivityType
  taskTitle: string
  newStatus?: string   // only for 'status_updated'
  timestamp: number    // unix ms
}

const MAX_STORED = 20

function key(userId: string) {
  return `task_activity_${userId}`
}

export function getActivities(userId: string): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}

export function appendActivity(
  userId: string,
  entry: Omit<ActivityEntry, 'id' | 'timestamp'>
): ActivityEntry[] {
  const existing = getActivities(userId)
  const newEntry: ActivityEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    timestamp: Date.now(),
  }
  const updated = [newEntry, ...existing].slice(0, MAX_STORED)
  try {
    localStorage.setItem(key(userId), JSON.stringify(updated))
  } catch {
    /* storage full — degrade gracefully */
  }
  return updated
}

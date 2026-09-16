// Single source of truth for task types and status values.
// Both TaskCard and KanbanColumn import from here.

export const STATUSES = ['Planned', 'In Progress', 'Complete'] as const
export type Status = typeof STATUSES[number]

export interface Task {
  id: string
  title: string
  status: Status
  created_at: string
}

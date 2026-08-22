export type TaskKind = 'fixed' | 'flexible' | 'self-care';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'inbox' | 'scheduled' | 'in-progress' | 'completed' | 'skipped' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  priority: TaskPriority;
  status: TaskStatus;
  durationMinutes?: number;
  deadline?: string;
  startsAt?: string;
  category?: string;
  notes?: string;
}

import type { Task } from '../types/task';

export interface SchedulingCandidate {
  task: Task;
  earliestStart?: string;
}

/**
 * First deterministic scheduling rule set.
 * AI may propose task metadata, but these rules remain application-owned.
 */
export const schedulingRules = {
  protectedKinds: ['fixed', 'self-care'] as const,
  priorityOrder: ['critical', 'high', 'medium', 'low'] as const,
  preserveBreathingRoom: true,
  avoidOverScheduling: true,
} as const;

export function isProtectedTask(task: Task): boolean {
  return task.kind === 'fixed' || task.kind === 'self-care';
}

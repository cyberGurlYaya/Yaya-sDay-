import type { Task } from './task';

export interface ScheduleItem {
  id: string;
  taskId: string;
  startsAt: string;
  endsAt: string;
  protected: boolean;
}

export interface DayPlan {
  date: string;
  timezone: string;
  tasks: Task[];
  schedule: ScheduleItem[];
}

export type ReplanEvent =
  | { type: 'task-completed'; taskId: string }
  | { type: 'task-skipped'; taskId: string }
  | { type: 'task-delayed'; taskId: string; minutes: number }
  | { type: 'task-added'; task: Task }
  | { type: 'commitment-changed'; taskId: string; startsAt?: string; deadline?: string }
  | { type: 'user-tired' };

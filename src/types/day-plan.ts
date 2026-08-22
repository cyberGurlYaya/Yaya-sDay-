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

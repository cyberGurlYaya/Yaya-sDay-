import type { Task } from '../types/task';
import type { DayPlan, ReplanEvent, ScheduleItem } from '../types/day-plan';
import { buildDayPlan, type ScheduledBlock } from './engine';

/** Rebuild only the remaining part of the day while preserving protected commitments. */
export function replanRemainingDay(tasks: Task[], currentPlan: DayPlan | null, event: ReplanEvent, now = new Date()): DayPlan {
  const updated = applyReplanEvent(tasks, event);
  const fresh = buildDayPlan(updated, now);
  const protectedItems = (currentPlan?.schedule ?? []).filter(item => item.protected && new Date(item.endsAt).getTime() > now.getTime());
  const merged = mergeProtectedItems(fresh, protectedItems);
  return {
    date: now.toISOString().slice(0, 10),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tasks: updated,
    schedule: merged.map((item) => ({
      id: item.id,
      taskId: item.id,
      startsAt: item.scheduledStart,
      endsAt: item.scheduledEnd,
      protected: item.isProtected,
    })),
  };
}

function applyReplanEvent(tasks: Task[], event: ReplanEvent): Task[] {
  switch (event.type) {
    case 'task-completed':
      return tasks.map(task => task.id === event.taskId ? { ...task, status: 'completed' } : task);
    case 'task-skipped':
      return tasks.map(task => task.id === event.taskId ? { ...task, status: 'skipped' } : task);
    case 'task-delayed': {
      return tasks.map(task => {
        if (task.id !== event.taskId) return task;
        const base = task.startsAt ? new Date(task.startsAt) : new Date();
        base.setMinutes(base.getMinutes() + event.minutes);
        return { ...task, startsAt: base.toISOString(), status: 'scheduled' };
      });
    }
    case 'task-added':
      return [event.task, ...tasks];
    case 'commitment-changed':
      return tasks.map(task => task.id === event.taskId ? { ...task, startsAt: event.startsAt, deadline: event.deadline } : task);
    case 'user-tired':
      return tasks.map(task => task.kind === 'self-care' ? { ...task, priority: task.priority === 'low' ? 'medium' : task.priority } : task);
  }
}

function mergeProtectedItems(fresh: ScheduledBlock[], protectedItems: ScheduleItem[]): ScheduledBlock[] {
  const byTask = new Map(fresh.map(item => [item.id, item]));
  for (const item of protectedItems) {
    const existing = byTask.get(item.taskId);
    if (existing) {
      byTask.set(item.taskId, { ...existing, scheduledStart: item.startsAt, scheduledEnd: item.endsAt, isProtected: true });
    }
  }
  return [...byTask.values()].sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
}

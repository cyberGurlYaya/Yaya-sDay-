import { Task } from '../types/task';

export type ScheduledBlock = Task & { scheduledStart: string; scheduledEnd: string; isProtected: boolean };

function minutesToDate(base: Date, minutes: number) {
  const d = new Date(base);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
}

function isoAt(base: Date, minutes: number) { return minutesToDate(base, minutes).toISOString(); }

/** Deterministic scheduling layer. AI may propose tasks, but this engine owns ordering and safety rules. */
export function buildDayPlan(tasks: Task[], date = new Date()): ScheduledBlock[] {
  const fixed = tasks.filter(t => t.kind === 'fixed' && t.startsAt).sort((a,b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
  const flexible = tasks.filter(t => t.kind !== 'fixed' && t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a,b) => priorityScore(b.priority) - priorityScore(a.priority));
  const result: ScheduledBlock[] = [];
  let cursor = 8 * 60;

  for (const task of fixed) {
    const start = new Date(task.startsAt!);
    const duration = Math.max(10, task.durationMinutes ?? 30);
    result.push({ ...task, scheduledStart: start.toISOString(), scheduledEnd: new Date(start.getTime() + duration * 60000).toISOString(), isProtected: true });
  }

  for (const task of flexible) {
    const duration = Math.max(10, task.durationMinutes ?? 30);
    const start = minutesToDate(date, cursor);
    const end = new Date(start.getTime() + duration * 60000);
    const overlaps = result.some(block => start < new Date(block.scheduledEnd) && end > new Date(block.scheduledStart));
    if (overlaps) {
      cursor += 30;
      continue;
    }
    result.push({ ...task, scheduledStart: start.toISOString(), scheduledEnd: end.toISOString(), isProtected: task.priority === 'critical' || task.kind === 'self-care' });
    cursor += duration + (duration >= 60 ? 15 : 10);
    // Never fill the entire day: leave at least 20 minutes of breathing room between blocks.
    if (cursor > 21 * 60) break;
  }

  return result.sort((a,b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
}

function priorityScore(priority: Task['priority']) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[priority];
}

export function parseNaturalTaskText(input: string): Partial<Task>[] {
  const pieces = input.split(/\n|,|\band\b/gi).map(s => s.trim()).filter(Boolean);
  return pieces.map(title => {
    const lower = title.toLowerCase();
    const kind: Task['kind'] = /(pray|salah|fajr|dhuhr|asr|maghrib|isha|appointment|meeting|class|shift)/i.test(title) ? 'fixed' : /(rest|sleep|break|eat|breakfast|lunch|dinner|bath)/i.test(title) ? 'self-care' : 'flexible';
    const priority: Task['priority'] = /(must|urgent|important|deadline|absolutely)/i.test(title) ? 'high' : 'medium';
    const durationMatch = lower.match(/(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)/);
    const durationMinutes = durationMatch ? (/hour|hr/.test(durationMatch[2]) ? Number(durationMatch[1]) * 60 : Number(durationMatch[1])) : kind === 'self-care' ? 30 : 45;
    return { title, kind, priority, durationMinutes, status: 'inbox' as const };
  });
}

import { Task } from '../types/task';

export type ScheduledBlock = Task & { scheduledStart: string; scheduledEnd: string; isProtected: boolean };

function minutesToDate(base: Date, minutes: number) {
  const d = new Date(base);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
}

function priorityScore(priority: Task['priority']) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[priority];
}

export function buildDayPlan(tasks: Task[], date = new Date()): ScheduledBlock[] {
  const fixed = tasks
    .filter(t => t.kind === 'fixed' && t.startsAt)
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
  const flexible = tasks
    .filter(t => t.kind !== 'fixed' && t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));
  const result: ScheduledBlock[] = [];
  let cursor = 8 * 60;

  for (const task of fixed) {
    const start = new Date(task.startsAt!);
    const duration = Math.max(10, task.durationMinutes ?? 30);
    result.push({
      ...task,
      scheduledStart: start.toISOString(),
      scheduledEnd: new Date(start.getTime() + duration * 60000).toISOString(),
      isProtected: true,
    });
  }

  for (const task of flexible) {
    const duration = Math.max(10, task.durationMinutes ?? 30);
    let start = minutesToDate(date, cursor);
    let end = new Date(start.getTime() + duration * 60000);
    const conflict = result.find(block => start < new Date(block.scheduledEnd) && end > new Date(block.scheduledStart));

    if (conflict) {
      cursor = Math.max(
        cursor + 10,
        new Date(conflict.scheduledEnd).getHours() * 60 + new Date(conflict.scheduledEnd).getMinutes(),
      );
      start = minutesToDate(date, cursor);
      end = new Date(start.getTime() + duration * 60000);
    }

    if (start.getHours() >= 22) break;
    result.push({
      ...task,
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      isProtected: task.priority === 'critical' || task.kind === 'self-care',
    });
    cursor += duration + (duration >= 60 ? 15 : 10);
    if (cursor > 21 * 60) break;
  }

  return result.sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
}

/**
 * Conservative local parsing used only when the AI service is unavailable.
 * A comma is deliberately NOT a task boundary. Brain-dumps are semantic input,
 * not CSV. We only split on strong structural boundaries such as new lines,
 * bullets, or explicit sequencing phrases.
 */
function splitBrainDump(input: string) {
  const normalized = input.replace(/[•·]/g, '\n').replace(/\r/g, '').trim();
  const chunks = normalized
    .split(/\n+|\s+(?:and then|then after that|after that|next I|next we)\s+/i)
    .map(s => s.trim())
    .filter(Boolean);
  return chunks.length ? chunks : [normalized];
}

export function parseNaturalTaskText(input: string, baseDate = new Date()): Partial<Task>[] {
  return splitBrainDump(input).map(title => {
    const lower = title.toLowerCase();
    const kind: Task['kind'] = /(pray|salah|fajr|dhuhr|zuhr|asr|maghrib|isha|tahajjud|appointment|meeting|class|shift)/i.test(title)
      ? 'fixed'
      : /(rest|sleep|break|eat|breakfast|lunch|dinner|bath|shower|nap|meal)/i.test(title)
        ? 'self-care'
        : 'flexible';

    const priority: Task['priority'] = /(critical|emergency)/i.test(title)
      ? 'critical'
      : /(must|urgent|important|deadline|absolutely|asap|before \w+)/i.test(title)
        ? 'high'
        : /(whenever|if i can|maybe|optional)/i.test(title)
          ? 'low'
          : 'medium';

    const durationMatch = lower.match(/(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)/);
    const durationMinutes = durationMatch
      ? (/hour|hr/.test(durationMatch[2]) ? Number(durationMatch[1]) * 60 : Number(durationMatch[1]))
      : kind === 'self-care' ? 30
        : /study|work|project|code|research/i.test(lower) ? 60
          : 45;

    const time = extractTime(title, baseDate, kind);
    const deadline = extractDeadline(title, baseDate);
    const cleanTitle = title
      .replace(/\s+(?:at|around|@|by)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:in the (?:morning|afternoon|evening|night))?/i, '')
      .replace(/\s+by\s+(?:today|tonight|tomorrow|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: cleanTitle || title,
      kind,
      priority,
      durationMinutes,
      status: 'inbox' as const,
      ...(time ? { startsAt: time } : {}),
      ...(deadline ? { deadline } : {}),
    };
  });
}

function parseClock(hourText: string, minuteText: string | undefined, meridiem: string | undefined, context: string) {
  let hour = Number(hourText);
  const minute = Number(minuteText || 0);
  const mer = meridiem?.toLowerCase();

  if (mer === 'pm' && hour < 12) hour += 12;
  if (mer === 'am' && hour === 12) hour = 0;

  if (!mer) {
    if (/\b(morning|dawn|early)\b/.test(context) && hour === 12) hour = 0;
    else if (/\b(afternoon|evening|night)\b/.test(context) && hour < 12) hour += 12;
    else if (hour <= 6) hour += 12;
  }

  return { hour, minute };
}

function extractTime(text: string, baseDate: Date, kind: Task['kind']) {
  const match = text.match(/(?:at|around|@|by)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:in the (morning|afternoon|evening|night))?/i);
  if (!match) return undefined;

  const context = text.toLowerCase();
  const { hour, minute } = parseClock(match[1], match[2], match[3], context);
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);

  if (/\bby\b/i.test(match[0]) && kind !== 'fixed') return undefined;
  return d.toISOString();
}

function extractDeadline(text: string, baseDate: Date) {
  const match = text.match(/\bby\s+(today|tonight|tomorrow|(?:\d{1,2})(?::(\d{2}))?\s*(?:am|pm)?(?:\s+in the\s+(?:morning|afternoon|evening|night))?)/i);
  if (!match) return undefined;

  const value = match[1].toLowerCase();
  const d = new Date(baseDate);

  if (value === 'tomorrow') {
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
  } else if (value === 'tonight') {
    d.setHours(21, 0, 0, 0);
  } else if (value === 'today') {
    d.setHours(23, 59, 0, 0);
  } else {
    const clock = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (clock) {
      const parsed = parseClock(clock[1], clock[2], clock[3], text.toLowerCase());
      d.setHours(parsed.hour, parsed.minute, 0, 0);
    }
  }

  return d.toISOString();
}

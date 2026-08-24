import type { AiTaskProposal, YayaPlanProposal } from './contracts';
import type { TaskKind, TaskPriority } from '../types/task';

const KINDS: TaskKind[] = ['fixed', 'flexible', 'self-care'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validIso(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function normalizeTask(value: unknown): AiTaskProposal | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!isString(raw.title)) return null;

  const kind = KINDS.includes(raw.kind as TaskKind) ? raw.kind as TaskKind : 'flexible';
  const priority = PRIORITIES.includes(raw.priority as TaskPriority) ? raw.priority as TaskPriority : 'medium';
  const duration = typeof raw.durationMinutes === 'number' && Number.isFinite(raw.durationMinutes)
    ? Math.min(180, Math.max(5, Math.round(raw.durationMinutes)))
    : 30;

  return {
    title: raw.title.trim().slice(0, 180),
    kind,
    priority,
    durationMinutes: duration,
    ...(validIso(raw.deadline) ? { deadline: raw.deadline } : {}),
    ...(validIso(raw.startsAt) ? { startsAt: raw.startsAt } : {}),
    ...(isString(raw.category) ? { category: raw.category.trim().slice(0, 80) } : {}),
    ...(isString(raw.notes) ? { notes: raw.notes.trim().slice(0, 500) } : {}),
  };
}

/** Application-owned boundary: model output is never trusted as application state. */
export function validateYayaProposal(value: unknown): YayaPlanProposal | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!isString(raw.message) || !Array.isArray(raw.tasks) || typeof raw.needsConfirmation !== 'boolean') return null;

  const tasks = raw.tasks.map(normalizeTask).filter((task): task is AiTaskProposal => Boolean(task)).slice(0, 30);
  return {
    message: raw.message.trim().slice(0, 500),
    tasks,
    needsConfirmation: raw.needsConfirmation,
  };
}

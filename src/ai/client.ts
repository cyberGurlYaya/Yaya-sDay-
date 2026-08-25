import { YayaPlanProposal } from './contracts';
import { parseNaturalTaskText } from '../scheduling/engine';

type YayaContext = {
  nickname?: string;
  personality?: string;
  muslimMode?: boolean;
  currentTasks?: Array<{ title: string; status: string; kind: string; priority: string }>;
};

function isValidProposal(value: unknown): value is YayaPlanProposal {
  if (!value || typeof value !== 'object') return false;
  const proposal = value as Partial<YayaPlanProposal>;
  return typeof proposal.message === 'string'
    && Array.isArray(proposal.tasks)
    && typeof proposal.needsConfirmation === 'boolean'
    && proposal.tasks.every(task =>
      task && typeof task.title === 'string'
        && ['fixed', 'flexible', 'self-care'].includes(task.kind as string)
        && ['low', 'medium', 'high', 'critical'].includes(task.priority as string)
    );
}

function isLikelyVenting(input: string) {
  const text = input.toLowerCase().trim();
  if (!text) return false;
  const hasAction = /\b(i need to|i have to|i need|remind me|schedule|plan|do|finish|study|work|pray|read|clean|cook|buy|call|send|go|meet|take|have my|book|submit|prepare|remember)\b/i.test(text);
  const isFeeling = /\b(i'?m|i am|i feel|feeling|just)\s+(so\s+)?(tired|sad|stressed|overwhelmed|anxious|drained|exhausted|confused|burnt out|burned out)\b/i.test(text);
  return isFeeling && !hasAction;
}

function offlineProposal(input: string, context: YayaContext): YayaPlanProposal {
  if (isLikelyVenting(input)) {
    return {
      message: `I hear you${context.nickname ? `, ${context.nickname}` : ''}. 💜 You don't have to turn every feeling into a task. Take a breath with me, and when you're ready, tell me what you actually need to get done.`,
      tasks: [],
      needsConfirmation: false,
    };
  }

  const tasks = parseNaturalTaskText(input).map(task => ({
    title: task.title || input,
    kind: task.kind || 'flexible',
    priority: task.priority || 'medium',
    durationMinutes: task.durationMinutes || 30,
    deadline: task.deadline,
    startsAt: task.startsAt,
    category: task.category,
    notes: task.notes,
    status: 'inbox' as const,
  }));

  if (!tasks.length) {
    return {
      message: `I'm listening${context.nickname ? `, ${context.nickname}` : ''}. Tell me what you want to get done, even if it comes out as one messy sentence. 🌸`,
      tasks: [],
      needsConfirmation: false,
    };
  }

  const selfCareCount = tasks.filter(task => task.kind === 'self-care').length;
  const fixedCount = tasks.filter(task => task.kind === 'fixed').length;
  const protections = [
    fixedCount ? 'protecting anything with a real fixed time' : '',
    selfCareCount ? 'keeping rest and self-care in the day' : 'leaving breathing room between bigger tasks',
  ].filter(Boolean).join(' and ');

  return {
    message: tasks.length === 1
      ? 'Got it. I captured that as one thing for now rather than guessing where your thoughts should be split. 🌸'
      : `I caught ${tasks.length} clear action groups. I’ll keep the day realistic, ${protections || 'without cramming everything together'}.`,
    tasks,
    needsConfirmation: false,
  };
}

export async function interpretWithYaya(input: string, context: YayaContext = {}): Promise<YayaPlanProposal> {
  const cleanInput = input.trim();
  if (!cleanInput) return offlineProposal('', context);

  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const endpoint = configuredBaseUrl
    ? `${configuredBaseUrl.replace(/\/$/, '')}/api/plan`
    : '/api/plan';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: cleanInput, context }),
    });
    if (response.ok) {
      const payload: unknown = await response.json();
      if (isValidProposal(payload)) return payload;
    }
  } catch {
    // Keep the local safety net; it must never invent task boundaries.
  }

  return offlineProposal(cleanInput, context);
}

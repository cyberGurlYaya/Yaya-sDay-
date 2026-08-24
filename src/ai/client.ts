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
    && proposal.tasks.every(task => task && typeof task.title === 'string');
}

function isLikelyVenting(input: string) {
  const text = input.toLowerCase().trim();
  if (!text) return false;
  const hasAction = /\b(i need to|i have to|i need|remind me|schedule|plan|do|finish|study|work|pray|read|clean|cook|buy|call|send|go|meet|take|have my|book|submit|prepare)\b/i.test(text);
  const isFeeling = /\b(i'?m|i am|i feel|feeling|just)\s+(so\s+)?(tired|sad|stressed|overwhelmed|anxious|drained|exhausted|confused|burnt out|burned out)\b/i.test(text);
  return isFeeling && !hasAction;
}

function offlineProposal(input: string, nickname?: string): YayaPlanProposal {
  if (isLikelyVenting(input)) {
    return {
      message: `I hear you${nickname ? `, ${nickname}` : ''}. 💜 You don't have to turn every feeling into a task. Take a breath with me, and when you're ready, tell me what you actually need to get done.`,
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
      message: `I'm listening${nickname ? `, ${nickname}` : ''}. Tell me what you want to get done, even if you say it in one messy sentence. 🌸`,
      tasks: [],
      needsConfirmation: false,
    };
  }

  return {
    message: tasks.length === 1
      ? `Got it. I heard “${tasks[0].title}”. I'll keep it realistic instead of just dumping it into a list. 🌸`
      : `I caught ${tasks.length} things. I've separated them so we can protect your fixed commitments, energy and breathing room instead of cramming your day. 💜`,
    tasks,
    needsConfirmation: tasks.length > 1,
  };
}

export async function interpretWithYaya(input: string, context: YayaContext = {}): Promise<YayaPlanProposal> {
  const cleanInput = input.trim();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (baseUrl && cleanInput) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/plan`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: cleanInput, context }),
      });
      if (response.ok) {
        const payload: unknown = await response.json();
        if (isValidProposal(payload)) return payload;
      }
    } catch {
      // Keep the companion usable offline. The deterministic fallback below is intentional.
    }
  }

  return offlineProposal(cleanInput, context.nickname);
}

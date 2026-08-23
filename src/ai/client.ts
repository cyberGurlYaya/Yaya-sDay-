import { YayaPlanProposal } from './contracts';
import { parseNaturalTaskText } from '../scheduling/engine';

export async function interpretWithYaya(input: string): Promise<YayaPlanProposal> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/plan`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ input }),
      });
      if (response.ok) return await response.json();
    } catch { /* offline fallback below */ }
  }
  const tasks = parseNaturalTaskText(input).map(task => ({
    title: task.title || input,
    kind: task.kind || 'flexible',
    priority: task.priority || 'medium',
    durationMinutes: task.durationMinutes || 30,
    status: 'inbox' as const,
  }));
  return { message: tasks.length === 1 ? `Got it. I added “${tasks[0].title}” to your tasks. 🌸` : `I caught ${tasks.length} things. I've added them to your task list so we can shape a realistic day. 💜`, tasks, needsConfirmation: tasks.length > 1 };
}

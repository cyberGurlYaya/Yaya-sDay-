import type { YayaPlanProposal } from '../../src/ai/contracts';

const SYSTEM_PROMPT = `You are Yaya, a warm, practical AI day-planning companion for people who hate typing their to-do lists.

The user may speak in a messy brain-dump: fragments, filler words, repeated thoughts, corrections, several tasks in one sentence, tasks mixed with feelings, or spoken-language mistakes. Never make the user organise their thoughts before you help.

CORE JOB
Understand what the person means, separate actionable work from feelings, and return a realistic plan proposal. Yaya is a companion, not a generic task parser.

THINK IN THIS ORDER
1. Understand intent before creating anything. The input can be task capture, a question, a request to change a plan, a feeling, or a mixture.
2. Extract distinct actionable tasks. Split clearly separate actions, but do not split one action just because it contains "and".
3. Preserve the user's meaning and wording. Keep task titles short and recognisable.
4. Never invent a deadline, appointment, location, duration, priority, or commitment.
5. Explicit times, appointments, classes, shifts, stated deadlines, prayer and explicitly protected spiritual practices are fixed/protected when the user actually gives them. "Important" alone does not make a task fixed.
6. Use sensible duration estimates only when useful: quick admin 10–20m, simple personal tasks 20–30m, study/work 45–60m, larger work 60–90m. Always prefer a user-stated duration.
7. Priority comes from language and context. "must", "urgent", "before X", "deadline", or a clearly time-sensitive commitment can be high/critical. Do not label everything urgent.
8. Protect human capacity. Rest, meals, sleep and self-care are real planning inputs. Leave breathing room after substantial blocks and do not create an impossible schedule.
9. If Muslim Mode is enabled and relevant, prayer and explicitly mentioned spiritual practices are protected. Never invent prayer times.
10. If the user asks to change an existing plan, treat current tasks as context and explain what you would change rather than blindly creating duplicates.
11. If uncertainty would materially change the plan, set needsConfirmation=true and ask exactly one short, friendly question.
12. If the user is only venting or sharing a thought without asking for action, keep tasks empty and respond naturally.
13. Never shame the user for being behind, lazy, overwhelmed, forgetful, or inconsistent.
14. Yaya should sound like a smart, affectionate friend: warm, concise, reassuring and lightly playful. Avoid baby talk, excessive emojis, fake enthusiasm and lectures.

OUTPUT
Return JSON only with exactly these keys:
message: short natural response, normally 1–3 sentences.
tasks: array of objects with title, kind, priority, durationMinutes and optional deadline, startsAt, category, notes, status.
needsConfirmation: boolean.

kind must be fixed, flexible, or self-care.
priority must be low, medium, high, or critical.
status should normally be inbox.
Do not put markdown fences or commentary outside the JSON.`;

function isValidProposal(value: unknown): value is YayaPlanProposal {
  if (!value || typeof value !== 'object') return false;
  const proposal = value as Partial<YayaPlanProposal>;
  return typeof proposal.message === 'string'
    && Array.isArray(proposal.tasks)
    && typeof proposal.needsConfirmation === 'boolean'
    && proposal.tasks.every(task =>
      task &&
      typeof task.title === 'string' &&
      ['fixed', 'flexible', 'self-care'].includes(task.kind as string) &&
      ['low', 'medium', 'high', 'critical'].includes(task.priority as string)
    );
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      input?: string;
      context?: {
        nickname?: string;
        personality?: string;
        muslimMode?: boolean;
        currentTasks?: Array<{ title: string; status: string; kind: string; priority: string }>;
      };
    };
    const input = body.input?.trim();
    if (!input) return Response.json({ error: 'input is required' }, { status: 400 });

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return Response.json({ error: 'AI provider is not configured yet.' }, { status: 503 });

    const contextText = JSON.stringify(body.context ?? {});
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1800,
        system: `${SYSTEM_PROMPT}

USER CONTEXT
${contextText}`,
        messages: [{ role: 'user', content: input }],
      }),
    });

    if (!response.ok) return Response.json({ error: `AI provider returned ${response.status}` }, { status: 502 });

    const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
    const text = data.content?.find(part => part.type === 'text')?.text || '';
    const clean = text.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`$/i, '').trim();
    const parsed: unknown = JSON.parse(clean);

    if (!isValidProposal(parsed)) {
      return Response.json({ error: 'AI returned an invalid planning proposal.' }, { status: 502 });
    }

    return Response.json(parsed);
  } catch {
    return Response.json({ error: 'Yaya could not create a plan right now.' }, { status: 500 });
  }
}

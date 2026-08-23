import type { YayaPlanProposal } from '../../src/ai/contracts';

const SYSTEM_PROMPT = `You are Yaya, a warm AI day-planning companion. Convert natural language into a realistic plan proposal. Never shame the user. Treat fixed commitments, prayer, appointments and deadlines as protected. Protect sleep, meals, rest and breathing room. Prefer reasonable estimates over over-scheduling. Return JSON only with: message, tasks, needsConfirmation. Each task must have title, kind (fixed|flexible|self-care), priority (low|medium|high|critical), durationMinutes, and optional deadline, startsAt, category, notes.`;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { input?: string };
    const input = body.input?.trim();
    if (!input) return Response.json({ error: 'input is required' }, { status: 400 });
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return Response.json({ error: 'AI provider is not configured yet.' }, { status: 503 });

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
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: input }],
      }),
    });
    if (!response.ok) return Response.json({ error: `AI provider returned ${response.status}` }, { status: 502 });
    const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
    const text = data.content?.find(part => part.type === 'text')?.text || '';
    const clean = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const proposal = JSON.parse(clean) as YayaPlanProposal;
    return Response.json(proposal);
  } catch {
    return Response.json({ error: 'Yaya could not create a plan right now.' }, { status: 500 });
  }
}

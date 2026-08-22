# Yaya Brain boundary

The AI layer is intentionally provider-agnostic. A provider adapter will convert model output into the `YayaPlanProposal` contract in `contracts.ts`.

The AI may:
- understand natural language;
- identify tasks, commitments, preferences, deadlines and context;
- estimate durations when appropriate;
- propose a plan.

The AI may not directly:
- write arbitrary database records;
- bypass scheduling rules;
- invoke sensitive device capabilities;
- silently change protected commitments.

Application services validate proposals before execution.

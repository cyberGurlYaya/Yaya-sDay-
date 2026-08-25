# V1 Fix Plan

- Make Android/iOS speech recognition explicitly check availability, permissions, and the device recognition service before starting.
- Keep the user's full chat message visible and keyboard-safe.
- Keep sent-message editing and re-processing intact.
- Remove nickname onboarding from the V1 flow; use the user's actual name only.
- Make the AI planner the source of truth when the API is configured.
- Make the offline fallback conservative: never split tasks merely because of commas.
- Strengthen the Yaya system prompt so semantic action boundaries, feelings, commitments, rest, and realistic planning are handled before task creation.

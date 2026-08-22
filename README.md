# Yaya'sDay 🌸

AI-powered personal day companion — helping people plan realistic days around their priorities, commitments, wellbeing, and rhythm.

> **Status:** Early development — architecture and foundation phase.

## Product vision
Yaya'sDay lets users tell Yaya naturally what they need to do. Yaya interprets the request, identifies fixed commitments and flexible tasks, protects rest and breathing room, creates a realistic plan, and adapts the day when plans change.

## Core principles
- Yaya feels like a companion, not a conventional to-do list.
- Natural language and voice are first-class interactions.
- AI interprets and proposes; deterministic application logic validates and executes.
- Rest, meals, sleep, breaks, and buffers are legitimate scheduling needs.
- Fixed commitments are protected; flexible tasks can move.
- Muslim Mode is optional and compassionate.
- Permissions and collected data are minimized.
- The product should never feel boring, noisy, or unnecessarily childish.

## Current architecture direction
- **Mobile:** React Native + Expo + TypeScript
- **Database:** PostgreSQL via Neon
- **Code/version control:** GitHub
- **Design:** Figma (current prototype is not final)
- **AI:** provider/model to be validated before production integration
- **Backend:** implementation choice is being validated; TypeScript and Python/FastAPI are both candidates

## Development approach
We are building incrementally through vertical slices rather than creating the entire product in one pass.

Planned sequence:
1. App foundation
2. Onboarding
3. My Day
4. Task capture
5. Yaya Brain + structured AI orchestration
6. Scheduling engine
7. Adaptive scheduling
8. Voice input
9. Notifications/device capabilities
10. Muslim Mode
11. Monetization
12. Security, accessibility, performance and release testing

## Future roadmap
- Focus Mode / app restrictions
- Hey Yaya background assistant
- Two-way spoken Yaya
- Kids Mode with parent ↔ child relationship
- Parent-created child tasks and monitoring
- Optional accountability/proof features
- Advanced personalization

## Documentation
The product and technical architecture are maintained in the project's Notion documentation. The implementation must preserve the architecture rule that AI output is structured, validated by application logic, and only then allowed to change state or invoke device capabilities.

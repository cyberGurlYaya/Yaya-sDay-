# Yaya'sDay — Technical Architecture

## Status
Architecture foundation. Technology choices that remain open are explicitly marked as decisions to validate.

## System shape

```text
React Native + Expo mobile app
        |
        v
API / application layer
        |
   +----+------------------+
   |                       |
   v                       v
Yaya AI orchestration   Scheduling engine
   |                       |
   +-----------+-----------+
               |
               v
        PostgreSQL / Neon
               |
        Notifications / device services
```

## Architectural rule
AI does not directly mutate application state or invoke sensitive device capabilities. AI produces structured intent/commands. Application logic validates schema, ownership, permissions, scheduling constraints, and allowed actions before persistence or device execution.

## Mobile
React Native + Expo + TypeScript.

Expo Router will provide route structure. UI code should remain separate from route files. The project should start with Expo Go where possible and move to custom development builds only when native requirements require them.

## Backend
The backend implementation is still a deliberate decision point. Candidates:

- TypeScript service for a unified language stack.
- Python + FastAPI if AI/data-processing requirements provide a meaningful advantage.

The backend must expose stable application APIs independent of the mobile UI and AI provider.

## Data
PostgreSQL hosted on Neon is the current database direction.

Initial domain entities:
- User
- YayaProfile
- Task
- ScheduleItem
- DayPlan
- Preference
- MuslimModeSettings
- NotificationPreference
- Subscription
- DeviceCapabilityState

## AI orchestration
The AI layer should transform natural-language input into validated structured data such as:
- task name
- date
- deadline
- duration
- priority
- category
- time preference
- fixed/flexible classification
- relevant context

The scheduling engine remains deterministic and owns constraint handling.

## Scheduling engine
Responsibilities:
- protect fixed commitments
- account for task duration
- respect deadlines and priorities
- preserve sleep/meals/rest/buffers
- avoid over-scheduling
- incorporate Muslim Mode prayer anchors when enabled
- reschedule flexible work when the day changes

## Voice
V1 direction: speech-to-text for natural input.

Future direction: text-to-speech and two-way spoken Yaya.

The voice provider is intentionally not locked until cost, latency, privacy, quality, and platform support are evaluated.

## Device capabilities
Potential V1/V1.x capabilities:
- notifications
- scheduled reminders
- alarms where supported
- microphone

Later:
- Android usage access
- app restriction / Focus Mode
- background assistant / wake phrase

Device permissions must be requested only when the relevant feature is used.

## Monetization
The product must have a clear free/premium model before launch. Subscription implementation and billing provider remain architecture decisions to validate against app-store requirements.

## Security
- Minimize data collection.
- Enforce user ownership at the API/data layer.
- Treat voice, schedules, spiritual practices, and future child data as privacy-sensitive.
- Keep parent/child authorization separate when Kids Mode is introduced.
- Do not request contacts, SMS, call logs, continuous location, or unrestricted file access without an explicit product requirement.

## Repository structure target

```text
app/
  (onboarding)/
  (tabs)/
  yaya/
components/
features/
  onboarding/
  tasks/
  scheduling/
  yaya/
  muslim-mode/
  notifications/
lib/
  api/
  storage/
  validation/
  utils/
types/
assets/
docs/
```

## Build strategy
Build vertical slices and keep `main` stable. Each meaningful feature should be developed, tested, and committed before moving to the next slice.

## Future compatibility
The architecture must leave room for:
- Kids Mode parent ↔ child accounts
- parent-created child tasks
- parent monitoring/controls
- Hey Yaya
- two-way voice
- Focus Mode
- optional accountability/proof
- advanced personalization

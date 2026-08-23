# Yaya'sDay — User Testing Readiness

## Product contract
- Yaya is a companion, not a generic to-do list.
- Users can brain-dump naturally; they should not have to organize tasks first.
- Rest, meals and breathing room are first-class scheduling inputs.
- Fixed commitments and protected spiritual time outrank flexible tasks.
- Yaya adapts when plans change without shaming the user.
- Muslim Mode is optional and compassionate.
- Personalization is user-controlled and reversible.
- AI proposes/understands; deterministic application logic validates and executes.

## Current functional foundation
- Persistent local profile and task storage.
- Personalized onboarding with generated nickname ideas and custom nickname input.
- Personality selection.
- Optional Muslim Mode setting.
- My Day view connected to real task state.
- Natural-language task capture with deterministic fallback parser.
- Deterministic day scheduling engine.
- Task completion/removal.
- Schedule view.
- Yaya chat surface.
- Local reminder notification service.
- Settings and Kids Mode product shell.
- Plus/monetization product surface.

## Before external user testing
1. Install dependencies with `npx expo install --fix`.
2. Run typecheck and fix all errors.
3. Verify Expo Go/development build uses the same SDK/native runtime as the project.
4. Verify onboarding persistence across reloads.
5. Verify task creation, completion and deletion.
6. Verify schedule output against the golden day-planning test case.
7. Verify notification permission and a short local reminder on a physical Android device.
8. Add production AI endpoint with secrets kept server-side; keep local parser as offline fallback.
9. Add real speech recognition in a development build; Expo Go is not sufficient for custom native speech modules.
10. Add authentication/backend only when multi-device sync, parent-child linking, subscriptions or cloud AI require it.
11. Add billing provider and server-side entitlement verification before charging users.
12. Add privacy policy, terms, data deletion flow and production analytics consent.
13. Build signed Android/iOS test binaries and run a structured QA pass.

## Golden test case
"I need to pray Tahajjud by 4:30 in the morning, read Qur'an for 10 minutes, pray Fajr, clean my room, have my bath, take tea/breakfast, study cybersecurity for two hours, work on my app, pray Zuhr, cook lunch, and I need time to rest in between because I know I'm going to get tired."

Expected behavior: extract tasks, protect fixed commitments, estimate reasonable durations, preserve rest and buffers, produce a realistic schedule, and allow the user to reshuffle it when life changes.

## Launch blockers
- Real AI backend and safety/validation layer
- Native speech input + eventual wake-word architecture
- Android Focus Mode native implementation
- Parent/child authenticated backend and permissions
- Subscription/payment integration
- Production authentication/sync strategy
- Security/privacy review
- Device QA and store compliance

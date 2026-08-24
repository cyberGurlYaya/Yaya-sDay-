# Yaya'sDay — Version 1 User Testing Readiness

This checklist is aligned to the Notion V1/V1.1 technical architecture. The Notion architecture is the product source of truth; this document is the repository-side QA gate.

## V1 product contract
- Yaya is a warm, intelligent companion, not a generic to-do list.
- Natural language and voice are first-class interactions.
- A messy brain-dump must be accepted without formatting.
- Yaya plans rather than merely records tasks.
- Fixed commitments are protected.
- Flexible tasks can move.
- Sleep, meals, rest, buffers and personal time are legitimate schedule elements.
- Yaya never shames the user for missed tasks or worship.
- AI interprets/proposes; deterministic application logic validates and executes.
- The experience stays warm and engaging without becoming noisy or childish.

## V1 scope gate
### Onboarding
- [ ] Personalized welcome
- [ ] Flower closes → blooms → expands → reveals Yaya'sDay
- [ ] Name capture
- [ ] Name-based fun nicknames
- [ ] Generate more nicknames
- [ ] Custom nickname
- [ ] Keep original name
- [ ] Gentle / Friendly / Firm / Strict personality
- [ ] Optional Muslim Mode

### Core day experience
- [ ] My Day home screen
- [ ] Natural-language task capture
- [ ] Voice input through native microphone + speech-to-text
- [ ] Task extraction and confirmation when ambiguity matters
- [ ] Fixed/flexible/self-care classification
- [ ] Priority and deadline understanding
- [ ] Duration estimation
- [ ] Deterministic scheduling
- [ ] Rest and buffer insertion
- [ ] Task complete / skip / edit / delay / reschedule
- [ ] Adaptive replanning after changes
- [ ] Notifications/reminders
- [ ] Talk to Yaya
- [ ] Encouraging progress reflection

### Muslim Mode
- [ ] Optional activation
- [ ] Prayer times treated as protected anchors when available
- [ ] Qur'an / dhikr / du'a / selected spiritual practices
- [ ] Compassionate reminders
- [ ] No shame/punishment for missed practices
- [ ] Ramadan/accountability expansion remains future scope

### Technical foundation
- [ ] React Native + Expo + TypeScript mobile
- [ ] Server-side AI orchestration with no provider secrets in the mobile bundle
- [ ] Structured AI contract and validation boundary
- [ ] Application-owned deterministic scheduling engine
- [ ] Persistent user/task/day-plan state
- [ ] Feature-specific permissions only
- [ ] Android real-device support for V1 device features
- [ ] Production authentication/cloud persistence before public launch
- [ ] Basic monetization foundation without artificially blocking the core experience

## Golden test case
"Okay, I need to pray Tahajjud by 4:30 in the morning, can you kindly wake me, read Qur'an for 10 minutes, pray Fajr, clean my room, have my bath, take tea/breakfast, study cybersecurity for two hours, work on my app, pray Zuhr, cook lunch, and I need time to rest in between because I know I'm going to get tired."

Expected: Yaya separates the actions, protects explicit/fixed commitments, estimates sensible durations, inserts rest and buffers, avoids filling every minute, and produces a realistic plan.

## Adaptive test cases
1. User completes a task early → remaining plan is recalculated.
2. User delays a flexible task → flexible work moves without unnecessarily moving protected items.
3. User skips a task → it is not treated as a moral failure; the remaining plan is recalculated.
4. User says they are tired → breathing room/self-care is preserved and lower-value flexible work can move.
5. User adds a new urgent task → scheduler incorporates it while protecting fixed commitments.
6. A fixed commitment changes → remaining flexible work is replanned around the new anchor.

## Device QA
- [ ] Fresh install opens the blooming welcome screen.
- [ ] Onboarding survives app restart.
- [ ] Voice permission works on a physical Android device.
- [ ] Speech recognition captures a messy multi-task brain dump.
- [ ] Yaya can fall back to typing when voice is unavailable.
- [ ] Reminder permission works and a short test reminder fires.
- [ ] Layout remains usable across small and large Android screens.
- [ ] Settings remain sectioned and readable.
- [ ] Reset flow clears local test data cleanly.

## Launch gate
A build is a **V1 user-testing candidate** only when the product scope above is implemented and the golden/adaptive/device test cases pass. Monetization and public launch work starts after user testing, not before.

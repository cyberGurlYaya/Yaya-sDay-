export const onboardingSteps = [
  'welcome',
  'name',
  'nickname',
  'personality',
  'muslim-mode',
  'complete',
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

export function nextStep(current: OnboardingStep): OnboardingStep {
  const index = onboardingSteps.indexOf(current);
  return onboardingSteps[Math.min(index + 1, onboardingSteps.length - 1)];
}

export function previousStep(current: OnboardingStep): OnboardingStep {
  const index = onboardingSteps.indexOf(current);
  return onboardingSteps[Math.max(index - 1, 0)];
}

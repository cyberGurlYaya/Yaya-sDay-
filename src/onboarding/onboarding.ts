export const onboardingSteps = [
  'welcome',
  'name',
  'nickname',
  'personality',
  'muslim-mode',
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

export interface OnboardingState {
  step: OnboardingStep;
  displayName: string;
  nickname: string;
  personality: 'gentle' | 'friendly' | 'firm' | 'strict';
  muslimModeEnabled: boolean;
}

export const initialOnboardingState: OnboardingState = {
  step: 'welcome',
  displayName: '',
  nickname: '',
  personality: 'friendly',
  muslimModeEnabled: false,
};

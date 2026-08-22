export type NicknameStyle = 'cute' | 'elegant' | 'playful' | 'sweet' | 'bold';

export interface NicknameSuggestion {
  value: string;
  style: NicknameStyle;
}

export interface OnboardingState {
  name: string;
  nickname: string;
  nicknameSource: 'generated' | 'custom' | 'original' | null;
  personality: 'gentle' | 'friendly' | 'firm' | 'strict' | null;
  muslimModeEnabled: boolean | null;
  completed: boolean;
}

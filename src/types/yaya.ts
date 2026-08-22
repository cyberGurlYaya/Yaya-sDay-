export type YayaPersonality = 'gentle' | 'friendly' | 'firm' | 'strict';

export interface YayaProfile {
  displayName: string;
  nickname: string;
  personality: YayaPersonality;
  muslimModeEnabled: boolean;
}

export interface ParsedTaskIntent {
  title: string;
  kind: 'fixed' | 'flexible' | 'self-care';
  durationMinutes?: number;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
}

export interface YayaPlanRequest {
  userMessage: string;
  timezone: string;
  muslimModeEnabled: boolean;
  now: string;
}

export interface YayaPlanProposal {
  tasks: ParsedTaskIntent[];
  needsConfirmation: boolean;
  explanation: string;
}

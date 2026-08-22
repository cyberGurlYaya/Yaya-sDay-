import type { TaskKind, TaskPriority } from '../types/task';

export interface AiTaskProposal {
  title: string;
  kind: TaskKind;
  priority: TaskPriority;
  durationMinutes?: number;
  deadline?: string;
  startsAt?: string;
  category?: string;
  notes?: string;
}

export interface YayaPlanProposal {
  message: string;
  tasks: AiTaskProposal[];
  needsConfirmation: boolean;
}

/**
 * Boundary between an AI provider and the application.
 * Provider-specific SDKs must not leak into the domain layer.
 */
export interface YayaInterpreter {
  interpret(input: string): Promise<YayaPlanProposal>;
}

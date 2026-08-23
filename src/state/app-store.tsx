import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Task } from '../types/task';

export type Personality = 'gentle' | 'friendly' | 'firm' | 'strict';
export type YayaProfile = {
  name: string;
  nickname: string;
  personality: Personality;
  muslimMode: boolean;
  voiceId?: string;
  onboardingComplete: boolean;
  onboardingVersion: number;
};

const STORAGE_KEY = '@yayasday/state/v1';
export const CURRENT_ONBOARDING_VERSION = 3;

export type AppState = {
  profile: YayaProfile;
  tasks: Task[];
};

const defaultState: AppState = {
  profile: { name: '', nickname: '', personality: 'friendly', muslimMode: false, voiceId: undefined, onboardingComplete: false, onboardingVersion: 0 },
  tasks: [],
};

type AppStore = AppState & {
  hydrated: boolean;
  saveProfile: (profile: Partial<YayaProfile>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  resetAll: () => void;
};

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AppState;
          setState({
            ...defaultState,
            ...parsed,
            profile: { ...defaultState.profile, ...(parsed.profile ?? {}) },
          });
        } catch { setState(defaultState); }
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, hydrated]);

  const value = useMemo<AppStore>(() => ({
    ...state,
    hydrated,
    saveProfile: patch => setState(prev => ({ ...prev, profile: { ...prev.profile, ...patch } })),
    addTask: task => setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] })),
    updateTask: (id, patch) => setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...patch } : t) })),
    removeTask: id => setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) })),
    resetAll: () => setState(defaultState),
  }), [state, hydrated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used inside AppProvider');
  return context;
}

export function makeTask(title: string, overrides: Partial<Task> = {}): Task {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(), kind: 'flexible', priority: 'medium', status: 'inbox', durationMinutes: 30,
    ...overrides,
  };
}

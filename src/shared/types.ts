export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  BREAK = 'BREAK',
  COMPLETED = 'COMPLETED',
  SCHEDULED = 'SCHEDULED'
}

export enum TimerMode {
  SIMPLE = 'SIMPLE',
  INTERVAL = 'INTERVAL'
}

export enum BlockingMode {
  BLACKLIST = 'BLACKLIST',
  WHITELIST = 'WHITELIST'
}

export type Theme = 'light' | 'dark' | 'system';

export interface IntervalConfig {
  focusDuration: number;
  shortBreakDuration: number;
  cycles: number;
}

export interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  startTime: number | null; // Timestamp when the timer started
  duration: number; // Duration in minutes (current phase)
  remainingSeconds: number; // Seconds remaining
  endTime: number | null; // Timestamp when the timer is expected to end (for alarm sync)
  // Interval specific
  intervalConfig?: IntervalConfig;
  currentCycle: number;
  totalCycles: number;
}

export interface Session {
  id: string;
  startTime: number;
  duration: number;
  completed: boolean;
  timestamp: number;
}

export const DEFAULT_TIMER_STATE: TimerState = {
  status: TimerStatus.IDLE,
  mode: TimerMode.SIMPLE,
  startTime: null,
  duration: 25,
  remainingSeconds: 25 * 60,
  endTime: null,
  currentCycle: 0,
  totalCycles: 1
};

export interface ScheduleConfig {
  enabled: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:MM" 24h format
  endTime: string; // "HH:MM" 24h format
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition?: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalFocusSeconds: number;
  xp: number;
  level: number;
  badges: string[];
  dailyTempAccess: { date: string; count: number };
}

export interface UserSettings {
  blockedSites: string[];
  whitelistedSites: string[];
  blockingMode: BlockingMode;
  showTabTitleTimer: boolean;
  schedule: ScheduleConfig;
  stats: UserStats;
  tempAccessLimit: number;
  theme: Theme;
}

import {
  TimerState,
  DEFAULT_TIMER_STATE,
  Session,
  BlockingMode,
  ScheduleConfig,
  UserStats
} from './types';
import {
  DEFAULT_BLOCKED_DOMAINS,
  DEFAULT_WHITELISTED_DOMAINS,
  DEFAULT_USER_SETTINGS
} from './constants';

const KEYS = {
  TIMER_STATE: 'timer_state',
  SESSIONS: 'sessions',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BLOCKED_SITES: 'blocked_sites',
  WHITELISTED_SITES: 'whitelisted_sites',
  BLOCKING_MODE: 'blocking_mode',
  SHOW_TAB_TITLE_TIMER: 'showTabTitleTimer',
  SCHEDULE: 'schedule',
  STATS: 'stats'
};

export const storage = {
  getBlockedSites: async (): Promise<string[]> => {
    const result = await chrome.storage.local.get(KEYS.BLOCKED_SITES);
    return result[KEYS.BLOCKED_SITES] || DEFAULT_BLOCKED_DOMAINS;
  },

  setBlockedSites: async (sites: string[]): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.BLOCKED_SITES]: sites });
  },

  onBlockedSitesChanged: (callback: (newSites: string[]) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.BLOCKED_SITES]) {
        callback(changes[KEYS.BLOCKED_SITES].newValue);
      }
    });
  },

  getWhitelistedSites: async (): Promise<string[]> => {
    const result = await chrome.storage.local.get(KEYS.WHITELISTED_SITES);
    return result[KEYS.WHITELISTED_SITES] || DEFAULT_WHITELISTED_DOMAINS;
  },

  setWhitelistedSites: async (sites: string[]): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.WHITELISTED_SITES]: sites });
  },

  onWhitelistedSitesChanged: (callback: (newSites: string[]) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.WHITELISTED_SITES]) {
        callback(changes[KEYS.WHITELISTED_SITES].newValue);
      }
    });
  },

  getBlockingMode: async (): Promise<BlockingMode> => {
    const result = await chrome.storage.local.get(KEYS.BLOCKING_MODE);
    return result[KEYS.BLOCKING_MODE] || DEFAULT_USER_SETTINGS.blockingMode;
  },

  setBlockingMode: async (mode: BlockingMode): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.BLOCKING_MODE]: mode });
  },

  onBlockingModeChanged: (callback: (newMode: BlockingMode) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.BLOCKING_MODE]) {
        callback(changes[KEYS.BLOCKING_MODE].newValue);
      }
    });
  },

  getOnboardingCompleted: async (): Promise<boolean> => {
    const result = await chrome.storage.local.get(KEYS.ONBOARDING_COMPLETED);
    return !!result[KEYS.ONBOARDING_COMPLETED];
  },

  setOnboardingCompleted: async (value: boolean): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.ONBOARDING_COMPLETED]: value });
  },

  getTimerState: async (): Promise<TimerState> => {
    const result = await chrome.storage.local.get(KEYS.TIMER_STATE);
    return result[KEYS.TIMER_STATE] || DEFAULT_TIMER_STATE;
  },

  setTimerState: async (state: TimerState): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.TIMER_STATE]: state });
  },

  onTimerStateChanged: (callback: (newState: TimerState) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.TIMER_STATE]) {
        callback(changes[KEYS.TIMER_STATE].newValue);
      }
    });
  },

  getSessions: async (): Promise<Session[]> => {
    const result = await chrome.storage.local.get(KEYS.SESSIONS);
    return result[KEYS.SESSIONS] || [];
  },

  saveSession: async (session: Session): Promise<void> => {
    const sessions = await storage.getSessions();
    sessions.unshift(session); // Add to beginning
    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.pop();
    }
    await chrome.storage.local.set({ [KEYS.SESSIONS]: sessions });
  },

  getDailyStats: async (): Promise<{ count: number; totalMinutes: number }> => {
    const sessions = await storage.getSessions();
    const today = new Date().toDateString();

    const todaySessions = sessions.filter(
      (session) => new Date(session.timestamp).toDateString() === today
    );

    const totalMinutes = todaySessions.reduce((acc, session) => {
      return acc + Math.round(session.duration / 60);
    }, 0);

    return {
      count: todaySessions.length,
      totalMinutes
    };
  },

  getShowTabTitleTimer: async (): Promise<boolean> => {
    const result = await chrome.storage.local.get(KEYS.SHOW_TAB_TITLE_TIMER);
    return result[KEYS.SHOW_TAB_TITLE_TIMER] !== false; // Default true
  },

  setShowTabTitleTimer: async (value: boolean): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.SHOW_TAB_TITLE_TIMER]: value });
  },

  getScheduleConfig: async (): Promise<ScheduleConfig> => {
    const result = await chrome.storage.local.get(KEYS.SCHEDULE);
    return result[KEYS.SCHEDULE] || DEFAULT_USER_SETTINGS.schedule;
  },

  setScheduleConfig: async (config: ScheduleConfig): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.SCHEDULE]: config });
  },

  onScheduleConfigChanged: (callback: (newConfig: ScheduleConfig) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.SCHEDULE]) {
        callback(changes[KEYS.SCHEDULE].newValue);
      }
    });
  },

  getUserStats: async (): Promise<UserStats> => {
    const result = await chrome.storage.local.get(KEYS.STATS);
    return result[KEYS.STATS] || DEFAULT_USER_SETTINGS.stats;
  },

  setUserStats: async (stats: UserStats): Promise<void> => {
    await chrome.storage.local.set({ [KEYS.STATS]: stats });
  },

  onUserStatsChanged: (callback: (newStats: UserStats) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[KEYS.STATS]) {
        callback(changes[KEYS.STATS].newValue);
      }
    });
  }
};

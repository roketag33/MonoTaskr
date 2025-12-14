import {
  TimerState,
  DEFAULT_TIMER_STATE,
  Session,
  BlockingMode,
  ScheduleConfig,
  UserStats,
  Theme
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
  STATS: 'stats',
  TEMP_OVERRIDES: 'temp_overrides',
  TEMP_ACCESS_LIMIT: 'temp_access_limit',
  THEME: 'theme'
};

// Define which keys belong to sync storage. All others default to local.
const SYNC_KEYS = [
  KEYS.BLOCKED_SITES,
  KEYS.WHITELISTED_SITES,
  KEYS.BLOCKING_MODE,
  KEYS.SHOW_TAB_TITLE_TIMER,
  KEYS.SCHEDULE,
  KEYS.STATS,
  KEYS.TEMP_ACCESS_LIMIT,
  KEYS.THEME,
  KEYS.ONBOARDING_COMPLETED
];

const isSyncKey = (key: string): boolean => SYNC_KEYS.includes(key);

const getStorage = (key: string) => (isSyncKey(key) ? chrome.storage.sync : chrome.storage.local);

const getStorageAreaName = (key: string) => (isSyncKey(key) ? 'sync' : 'local');

export const storage = {
  getTempOverrides: async (): Promise<Record<string, number>> => {
    const result = await getStorage(KEYS.TEMP_OVERRIDES).get(KEYS.TEMP_OVERRIDES);
    return result[KEYS.TEMP_OVERRIDES] || {};
  },

  setTempOverrides: async (overrides: Record<string, number>): Promise<void> => {
    await getStorage(KEYS.TEMP_OVERRIDES).set({ [KEYS.TEMP_OVERRIDES]: overrides });
  },

  onTempOverridesChanged: (callback: (newOverrides: Record<string, number>) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.TEMP_OVERRIDES) && changes[KEYS.TEMP_OVERRIDES]) {
        callback(changes[KEYS.TEMP_OVERRIDES].newValue);
      }
    });
  },

  getTempAccessLimit: async (): Promise<number> => {
    const result = await getStorage(KEYS.TEMP_ACCESS_LIMIT).get(KEYS.TEMP_ACCESS_LIMIT);
    return result[KEYS.TEMP_ACCESS_LIMIT] ?? DEFAULT_USER_SETTINGS.tempAccessLimit;
  },

  setTempAccessLimit: async (limit: number): Promise<void> => {
    await getStorage(KEYS.TEMP_ACCESS_LIMIT).set({ [KEYS.TEMP_ACCESS_LIMIT]: limit });
  },

  getTheme: async (): Promise<Theme> => {
    const result = await getStorage(KEYS.THEME).get(KEYS.THEME);
    return result[KEYS.THEME] ?? DEFAULT_USER_SETTINGS.theme;
  },

  setTheme: async (theme: Theme): Promise<void> => {
    await getStorage(KEYS.THEME).set({ [KEYS.THEME]: theme });
  },

  onThemeChanged: (callback: (theme: Theme) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.THEME) && changes[KEYS.THEME]) {
        callback(changes[KEYS.THEME].newValue);
      }
    });
  },

  getBlockedSites: async (): Promise<string[]> => {
    const result = await getStorage(KEYS.BLOCKED_SITES).get(KEYS.BLOCKED_SITES);
    return result[KEYS.BLOCKED_SITES] || DEFAULT_BLOCKED_DOMAINS;
  },

  setBlockedSites: async (sites: string[]): Promise<void> => {
    await getStorage(KEYS.BLOCKED_SITES).set({ [KEYS.BLOCKED_SITES]: sites });
  },

  onBlockedSitesChanged: (callback: (newSites: string[]) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.BLOCKED_SITES) && changes[KEYS.BLOCKED_SITES]) {
        callback(changes[KEYS.BLOCKED_SITES].newValue);
      }
    });
  },

  getWhitelistedSites: async (): Promise<string[]> => {
    const result = await getStorage(KEYS.WHITELISTED_SITES).get(KEYS.WHITELISTED_SITES);
    return result[KEYS.WHITELISTED_SITES] || DEFAULT_WHITELISTED_DOMAINS;
  },

  setWhitelistedSites: async (sites: string[]): Promise<void> => {
    await getStorage(KEYS.WHITELISTED_SITES).set({ [KEYS.WHITELISTED_SITES]: sites });
  },

  onWhitelistedSitesChanged: (callback: (newSites: string[]) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.WHITELISTED_SITES) && changes[KEYS.WHITELISTED_SITES]) {
        callback(changes[KEYS.WHITELISTED_SITES].newValue);
      }
    });
  },

  getBlockingMode: async (): Promise<BlockingMode> => {
    const result = await getStorage(KEYS.BLOCKING_MODE).get(KEYS.BLOCKING_MODE);
    return result[KEYS.BLOCKING_MODE] || DEFAULT_USER_SETTINGS.blockingMode;
  },

  setBlockingMode: async (mode: BlockingMode): Promise<void> => {
    await getStorage(KEYS.BLOCKING_MODE).set({ [KEYS.BLOCKING_MODE]: mode });
  },

  onBlockingModeChanged: (callback: (newMode: BlockingMode) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.BLOCKING_MODE) && changes[KEYS.BLOCKING_MODE]) {
        callback(changes[KEYS.BLOCKING_MODE].newValue);
      }
    });
  },

  getOnboardingCompleted: async (): Promise<boolean> => {
    const result = await getStorage(KEYS.ONBOARDING_COMPLETED).get(KEYS.ONBOARDING_COMPLETED);
    return !!result[KEYS.ONBOARDING_COMPLETED];
  },

  setOnboardingCompleted: async (value: boolean): Promise<void> => {
    await getStorage(KEYS.ONBOARDING_COMPLETED).set({ [KEYS.ONBOARDING_COMPLETED]: value });
  },

  getTimerState: async (): Promise<TimerState> => {
    const result = await getStorage(KEYS.TIMER_STATE).get(KEYS.TIMER_STATE);
    return result[KEYS.TIMER_STATE] || DEFAULT_TIMER_STATE;
  },

  setTimerState: async (state: TimerState): Promise<void> => {
    await getStorage(KEYS.TIMER_STATE).set({ [KEYS.TIMER_STATE]: state });
  },

  onTimerStateChanged: (callback: (newState: TimerState) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.TIMER_STATE) && changes[KEYS.TIMER_STATE]) {
        callback(changes[KEYS.TIMER_STATE].newValue);
      }
    });
  },

  getSessions: async (): Promise<Session[]> => {
    const result = await getStorage(KEYS.SESSIONS).get(KEYS.SESSIONS);
    return result[KEYS.SESSIONS] || [];
  },

  saveSession: async (session: Session): Promise<void> => {
    const sessions = await storage.getSessions();
    sessions.unshift(session); // Add to beginning
    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.pop();
    }
    await getStorage(KEYS.SESSIONS).set({ [KEYS.SESSIONS]: sessions });
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
    const result = await getStorage(KEYS.SHOW_TAB_TITLE_TIMER).get(KEYS.SHOW_TAB_TITLE_TIMER);
    return result[KEYS.SHOW_TAB_TITLE_TIMER] !== false; // Default true
  },

  setShowTabTitleTimer: async (value: boolean): Promise<void> => {
    await getStorage(KEYS.SHOW_TAB_TITLE_TIMER).set({ [KEYS.SHOW_TAB_TITLE_TIMER]: value });
  },

  getScheduleConfig: async (): Promise<ScheduleConfig> => {
    const result = await getStorage(KEYS.SCHEDULE).get(KEYS.SCHEDULE);
    return result[KEYS.SCHEDULE] || DEFAULT_USER_SETTINGS.schedule;
  },

  setScheduleConfig: async (config: ScheduleConfig): Promise<void> => {
    await getStorage(KEYS.SCHEDULE).set({ [KEYS.SCHEDULE]: config });
  },

  onScheduleConfigChanged: (callback: (newConfig: ScheduleConfig) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.SCHEDULE) && changes[KEYS.SCHEDULE]) {
        callback(changes[KEYS.SCHEDULE].newValue);
      }
    });
  },

  getUserStats: async (): Promise<UserStats> => {
    const result = await getStorage(KEYS.STATS).get(KEYS.STATS);
    const savedStats = result[KEYS.STATS] || {};
    // Merge with defaults to ensure new fields like dailyTempAccess exist
    return { ...DEFAULT_USER_SETTINGS.stats, ...savedStats };
  },

  setUserStats: async (stats: UserStats): Promise<void> => {
    await getStorage(KEYS.STATS).set({ [KEYS.STATS]: stats });
  },

  onUserStatsChanged: (callback: (newStats: UserStats) => void) => {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === getStorageAreaName(KEYS.STATS) && changes[KEYS.STATS]) {
        callback(changes[KEYS.STATS].newValue);
      }
    });
  }
};

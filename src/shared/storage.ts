import { TimerState, DEFAULT_TIMER_STATE, Session } from './types';
import { DEFAULT_BLOCKED_DOMAINS } from './constants';

const KEYS = {
    TIMER_STATE: 'timer_state',
    SESSIONS: 'sessions',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    BLOCKED_SITES: 'blocked_sites',
    SHOW_TAB_TITLE_TIMER: 'showTabTitleTimer'
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

        const todaySessions = sessions.filter(session =>
            new Date(session.timestamp).toDateString() === today
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
    }
};

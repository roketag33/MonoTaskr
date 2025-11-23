import { TimerState, DEFAULT_TIMER_STATE, Session } from './types';

const KEYS = {
    TIMER_STATE: 'timer_state',
    SESSIONS: 'sessions'
};

export const storage = {
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
    }
};

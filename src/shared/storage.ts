import { TimerState, DEFAULT_TIMER_STATE } from './types';

const KEYS = {
    TIMER_STATE: 'timer_state'
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
    }
};

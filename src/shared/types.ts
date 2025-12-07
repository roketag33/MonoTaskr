export enum TimerStatus {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED'
}

export enum BlockingMode {
    BLACKLIST = 'BLACKLIST',
    WHITELIST = 'WHITELIST'
}

export interface TimerState {
    status: TimerStatus;
    startTime: number | null; // Timestamp when the timer started
    duration: number; // Duration in minutes
    remainingSeconds: number; // Seconds remaining
    endTime: number | null; // Timestamp when the timer is expected to end (for alarm sync)
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
    startTime: null,
    duration: 25,
    remainingSeconds: 25 * 60,
    endTime: null
};

export interface UserSettings {
    blockedSites: string[];
    whitelistedSites: string[];
    blockingMode: BlockingMode;
    showTabTitleTimer: boolean;
}

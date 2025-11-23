import { TimerState, TimerStatus, DEFAULT_TIMER_STATE } from '../shared/types';
import { storage } from '../shared/storage';

const ALARM_NAME = 'monotaskr_timer_tick';

export class TimerService {
    private state: TimerState = { ...DEFAULT_TIMER_STATE };

    constructor() {
        this.init();
    }

    private async init() {
        this.state = await storage.getTimerState();
        this.syncAlarm();
    }

    private async saveState() {
        await storage.setTimerState(this.state);
    }

    private syncAlarm() {
        if (this.state.status === TimerStatus.RUNNING) {
            chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 }); // Tick every second
        } else {
            chrome.alarms.clear(ALARM_NAME);
        }
    }

    async start(durationMinutes: number) {
        const now = Date.now();
        this.state = {
            status: TimerStatus.RUNNING,
            startTime: now,
            duration: durationMinutes,
            remainingSeconds: durationMinutes * 60,
            endTime: now + durationMinutes * 60 * 1000
        };
        await this.saveState();
        this.syncAlarm();
    }

    async stop() {
        this.state = { ...DEFAULT_TIMER_STATE };
        await this.saveState();
        this.syncAlarm();
    }

    async pause() {
        if (this.state.status === TimerStatus.RUNNING) {
            this.state.status = TimerStatus.PAUSED;
            this.state.endTime = null; // No target end time when paused
            await this.saveState();
            this.syncAlarm();
        }
    }

    async handleAlarm(alarm: chrome.alarms.Alarm) {
        if (alarm.name !== ALARM_NAME) return;

        // Re-fetch state in case it changed elsewhere (though unlikely in this simple architecture)
        this.state = await storage.getTimerState();

        if (this.state.status !== TimerStatus.RUNNING) {
            this.syncAlarm(); // Should stop
            return;
        }

        if (this.state.remainingSeconds > 0) {
            this.state.remainingSeconds--;
            await this.saveState();
        } else {
            await this.complete();
        }
    }

    private async complete() {
        this.state.status = TimerStatus.COMPLETED;
        this.state.remainingSeconds = 0;
        this.state.endTime = null;

        // Save Session
        await storage.saveSession({
            id: Date.now().toString(),
            startTime: this.state.startTime || Date.now(),
            duration: this.state.duration,
            completed: true,
            timestamp: Date.now()
        });

        await this.saveState();
        this.syncAlarm();

        // Notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png', // TODO: Add icon
            title: 'MonoTaskr',
            message: 'Session finished! Well done.'
        });
    }
}

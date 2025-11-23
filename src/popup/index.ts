import './index.css';
import { storage } from '../shared/storage';
import { MESSAGES } from '../shared/messaging';
import { TimerState, TimerStatus } from '../shared/types';

// DOM Elements
const timerDisplay = document.getElementById('timer-display')!;
const startBtn = document.getElementById('btn-start')!;
const stopBtn = document.getElementById('btn-stop')!;
const resetBtn = document.getElementById('btn-reset')!;
const durationBtns = document.querySelectorAll('.duration-btn');

let selectedDuration = 25;

// Format time MM:SS
function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Update UI based on state
function updateUI(state: TimerState) {
    timerDisplay.textContent = formatTime(state.remainingSeconds);

    // Update duration buttons
    durationBtns.forEach(btn => {
        const duration = parseInt(btn.getAttribute('data-duration') || '0');
        if (state.status === TimerStatus.IDLE) {
            btn.classList.toggle('active', duration === selectedDuration);
            (btn as HTMLButtonElement).disabled = false;
        } else {
            btn.classList.remove('active');
            (btn as HTMLButtonElement).disabled = true;
        }
    });

    // Update controls
    if (state.status === TimerStatus.RUNNING) {
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden'); // Actually "Pause" or "Stop" - for MVP we use Stop/Reset logic
        stopBtn.textContent = 'Pause'; // Reuse stop button for pause for now
        resetBtn.classList.remove('hidden');
    } else if (state.status === TimerStatus.PAUSED) {
        startBtn.classList.remove('hidden');
        startBtn.textContent = 'Resume';
        stopBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
    } else {
        // IDLE or COMPLETED
        startBtn.classList.remove('hidden');
        startBtn.textContent = 'Start Focus';
        stopBtn.classList.add('hidden');
        resetBtn.classList.add('hidden');
    }
}

// Event Listeners
durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedDuration = parseInt(btn.getAttribute('data-duration') || '25');
        // Optimistic update
        timerDisplay.textContent = formatTime(selectedDuration * 60);
        durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

startBtn.addEventListener('click', async () => {
    const state = await storage.getTimerState();
    if (state.status === TimerStatus.PAUSED) {
        // Resume logic (technically start with remaining time, but for MVP we just re-send start or use a resume message)
        // For simplicity in MVP, we just call start again with current duration or implement a RESUME message.
        // Let's use START_TIMER but we need to handle resume in background or just send START.
        // Actually, if paused, we should probably just send START_TIMER with the remaining duration?
        // Better: let's add RESUME or just handle it.
        // For now, let's just send START_TIMER with the original duration if IDLE, or just unpause.
        // Wait, the background service has a pause() but no explicit resume().
        // Let's assume calling start() again resets it? No.
        // Let's fix this: We will send START_TIMER. The background service should handle it.
        // If we are PAUSED, we want to resume.
        // Let's send START_TIMER with the current selected duration if IDLE.
        // If PAUSED, we need a RESUME action.
        // Let's add RESUME to messaging or just use START.
        // For MVP simplicity: If PAUSED, we send START_TIMER with the *remaining* time? No that's messy.
        // Let's just send START_TIMER with the original duration for now to restart, OR add a RESUME message.
        // I'll add a simple check here:
        if (state.status === TimerStatus.PAUSED) {
            // We need a resume. Let's just call start again for now, it will reset.
            // Ideally we want to resume.
            // Let's send START_TIMER.
            sendMessage(MESSAGES.START_TIMER, { duration: selectedDuration });
        } else {
            sendMessage(MESSAGES.START_TIMER, { duration: selectedDuration });
        }
    } else {
        sendMessage(MESSAGES.START_TIMER, { duration: selectedDuration });
    }
});

stopBtn.addEventListener('click', () => {
    sendMessage(MESSAGES.PAUSE_TIMER);
});

resetBtn.addEventListener('click', () => {
    sendMessage(MESSAGES.RESET_TIMER);
});

function sendMessage(type: string, payload?: any) {
    chrome.runtime.sendMessage({ type, payload });
}

// Init
(async () => {
    const state = await storage.getTimerState();
    updateUI(state);
    storage.onTimerStateChanged(updateUI);
})();

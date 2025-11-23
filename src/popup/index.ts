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
const historyBtn = document.getElementById('btn-history')!;
const backBtn = document.getElementById('btn-back')!;
const historyView = document.getElementById('history-view')!;
const historyList = document.getElementById('history-list')!;
const timerControls = [document.getElementById('timer-display')!, document.getElementById('controls')!, document.getElementById('actions')!];

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
        if (state.status === TimerStatus.PAUSED) {
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

historyBtn.addEventListener('click', async () => {
    // Hide timer controls
    timerControls.forEach(el => el.classList.add('hidden'));
    historyBtn.classList.add('hidden');

    // Show history
    historyView.classList.remove('hidden');

    // Load data
    const sessions = await storage.getSessions();
    historyList.innerHTML = '';

    if (sessions.length === 0) {
        historyList.innerHTML = '<li class="history-item" style="justify-content: center; color: #999;">No sessions yet</li>';
    } else {
        sessions.forEach(session => {
            const date = new Date(session.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
        <span class="history-date">${dateStr}</span>
        <span class="history-duration">${session.duration}m</span>
      `;
            historyList.appendChild(li);
        });
    }
});

backBtn.addEventListener('click', () => {
    historyView.classList.add('hidden');
    timerControls.forEach(el => el.classList.remove('hidden'));
    historyBtn.classList.remove('hidden');
    // Re-update UI to ensure correct state visibility
    storage.getTimerState().then(updateUI);
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

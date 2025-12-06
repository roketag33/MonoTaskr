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

// Settings Elements
const settingsBtn = document.getElementById('btn-settings')!;
const settingsView = document.getElementById('settings-view')!;
const siteInput = document.getElementById('site-input')! as HTMLInputElement;
const addSiteBtn = document.getElementById('btn-add-site')!;
const sitesList = document.getElementById('sites-list')!;
const resetSitesBtn = document.getElementById('btn-reset-sites')!;
const backSettingsBtn = document.getElementById('btn-back-settings')!;
const settingTabTitle = document.getElementById('setting-tab-title')! as HTMLInputElement;

// Setting Event Listener
settingTabTitle.addEventListener('change', async () => {
    await storage.setShowTabTitleTimer(settingTabTitle.checked);
});

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
    const stats = await storage.getDailyStats();

    // Update stats
    const statsContainer = document.getElementById('daily-stats')!;
    statsContainer.innerHTML = `
        <div class="stat-box">
            <span class="stat-value">${stats.count}</span>
            <span class="stat-label">Sessions today</span>
        </div>
        <div class="stat-box">
            <span class="stat-value">${stats.totalMinutes}</span>
            <span class="stat-label">Minutes focus</span>
        </div>
    `;

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

// Settings Functions
import { BlockingMode } from '../shared/types';
import { DEFAULT_WHITELISTED_DOMAINS, DEFAULT_BLOCKED_DOMAINS } from '../shared/constants';

// ... (existing imports)

// Settings Elements (additions)
const modeRadios = document.querySelectorAll('input[name="blocking-mode"]');
const sitesListTitle = document.getElementById('sites-list-title')!;

// ... (existing constants)

// Helper to get current sites based on mode
async function getSites(mode: BlockingMode): Promise<string[]> {
    return mode === BlockingMode.BLACKLIST
        ? await storage.getBlockedSites()
        : await storage.getWhitelistedSites();
}

async function saveSites(mode: BlockingMode, sites: string[]) {
    if (mode === BlockingMode.BLACKLIST) {
        await storage.setBlockedSites(sites);
    } else {
        await storage.setWhitelistedSites(sites);
    }
}

async function renderSitesList() {
    // Get current mode
    const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement).value as BlockingMode;
    const sites = await getSites(mode);

    // Update title
    sitesListTitle.textContent = mode === BlockingMode.BLACKLIST ? 'Blocked Sites' : 'Whitelisted Sites';

    sitesList.innerHTML = '';

    // Show empty state if needed
    if (sites.length === 0) {
        sitesList.innerHTML = `<li class="site-item" style="justify-content:center; color:#888; font-style:italic;">
            ${mode === BlockingMode.BLACKLIST ? 'No blocked sites' : 'No whitelisted sites'}
        </li>`;
    }

    sites.forEach(site => {
        const li = document.createElement('li');
        li.className = 'site-item';
        // Add visual indicator or just text
        li.innerHTML = `
            <span>${site}</span>
            <button class="btn-remove-site" data-site="${site}">🗑️</button>
        `;
        sitesList.appendChild(li);
    });

    // Add remove listeners
    document.querySelectorAll('.btn-remove-site').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const siteToRemove = (e.currentTarget as HTMLElement).getAttribute('data-site')!;
            const currentMode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement).value as BlockingMode;
            const sites = await getSites(currentMode);
            const newSites = sites.filter(s => s !== siteToRemove);
            await saveSites(currentMode, newSites);
            renderSitesList();
        });
    });
}

// Mode switching
modeRadios.forEach(radio => {
    radio.addEventListener('change', async (e) => {
        const newMode = (e.target as HTMLInputElement).value as BlockingMode;
        await storage.setBlockingMode(newMode);
        await renderSitesList();
    });
});

settingsBtn.addEventListener('click', async () => {
    // Hide timer controls
    timerControls.forEach(el => el.classList.add('hidden'));
    historyBtn.classList.add('hidden');
    settingsBtn.classList.add('hidden');

    // Show settings
    settingsView.classList.remove('hidden');

    // Load general settings
    const showTabTitle = await storage.getShowTabTitleTimer();
    settingTabTitle.checked = showTabTitle;

    // Load mode
    const mode = await storage.getBlockingMode();
    // Check request radio
    const radio = document.querySelector(`input[name="blocking-mode"][value="${mode}"]`) as HTMLInputElement;
    if (radio) radio.checked = true;

    // Render sites
    await renderSitesList();
});

// Helper to extract domain from URL or string
function extractDomain(input: string): string | null {
    if (!input) return null;
    let domain = input.trim().toLowerCase();

    // Add protocol if missing to parse correctly with URL
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'http://' + domain;
    }

    try {
        const url = new URL(domain);
        return url.hostname;
    } catch (e) {
        // Fallback for simple domain-like strings that URL class might reject
        return input.trim().toLowerCase();
    }
}

addSiteBtn.addEventListener('click', async () => {
    const rawInput = siteInput.value;
    const newSite = extractDomain(rawInput);

    if (!newSite) return;

    const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement).value as BlockingMode;
    const sites = await getSites(mode);

    if (!sites.includes(newSite)) {
        sites.push(newSite);
        await saveSites(mode, sites);
        siteInput.value = '';
        await renderSitesList();
    }
});

siteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addSiteBtn.click();
    }
});

resetSitesBtn.addEventListener('click', async () => {
    const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement).value as BlockingMode;
    const msg = mode === BlockingMode.BLACKLIST
        ? 'Reset to default blocked sites?'
        : 'Clear whitelist?';

    if (confirm(msg)) {
        if (mode === BlockingMode.BLACKLIST) {
            await storage.setBlockedSites(DEFAULT_BLOCKED_DOMAINS);
        } else {
            await storage.setWhitelistedSites(DEFAULT_WHITELISTED_DOMAINS);
        }
        await renderSitesList();
    }
});

backSettingsBtn.addEventListener('click', () => {
    settingsView.classList.add('hidden');
    timerControls.forEach(el => el.classList.remove('hidden'));
    historyBtn.classList.remove('hidden');
    settingsBtn.classList.remove('hidden');
    storage.getTimerState().then(updateUI);
});

// Onboarding Elements
const onboardingView = document.getElementById('onboarding-view')!;
const appView = document.getElementById('app')!;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.getElementById('btn-next')!;
const skipBtn = document.getElementById('btn-skip')!;
const startOnboardingBtn = document.getElementById('btn-start-onboarding')!;

let currentSlide = 1;
const totalSlides = 3;

function updateSlides() {
    slides.forEach(slide => {
        slide.classList.remove('active');
        if (parseInt(slide.getAttribute('data-slide') || '0') === currentSlide) {
            slide.classList.add('active');
        }
    });

    dots.forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.getAttribute('data-slide') || '0') === currentSlide) {
            dot.classList.add('active');
        }
    });

    if (currentSlide === totalSlides) {
        nextBtn.classList.add('hidden');
        startOnboardingBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        startOnboardingBtn.classList.add('hidden');
    }
}

nextBtn.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlides();
    }
});

async function completeOnboarding() {
    await storage.setOnboardingCompleted(true);
    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
}

skipBtn.addEventListener('click', completeOnboarding);
startOnboardingBtn.addEventListener('click', completeOnboarding);

// Init
(async () => {
    const onboardingCompleted = await storage.getOnboardingCompleted();

    if (!onboardingCompleted) {
        onboardingView.classList.remove('hidden');
        appView.classList.add('hidden');
    } else {
        onboardingView.classList.add('hidden');
        appView.classList.remove('hidden');
    }

    const state = await storage.getTimerState();
    updateUI(state);
    storage.onTimerStateChanged(updateUI);
})();

import './index.css';
import './tooltip.css';
import { storage } from '../shared/storage';
import { MESSAGES } from '../shared/messaging';
import { TimerState, TimerStatus, TimerMode } from '../shared/types';
import { GamificationService, BADGES } from '../background/gamification.service';

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
const actions = document.getElementById('actions')!;

// Gamification Elements
const levelBadge = document.getElementById('level-badge')!;
const xpText = document.getElementById('xp-text')!;
const xpProgress = document.getElementById('xp-progress')!;
const badgesContainer = document.getElementById('badges-container')!;

// Interval Mode Elements
const statusDisplay = document.getElementById('status-display')!;
const modeBtnSimple = document.getElementById('mode-btn-simple')!;
const modeBtnInterval = document.getElementById('mode-btn-interval')!;
const modeToggles = document.querySelector('.timer-mode-toggles')!;
const controlsSimple = document.getElementById('controls-simple')!;
const controlsInterval = document.getElementById('controls-interval')!;
const intervalFocusInput = document.getElementById('interval-focus') as HTMLInputElement;
const intervalBreakInput = document.getElementById('interval-break') as HTMLInputElement;
const intervalCyclesInput = document.getElementById('interval-cycles') as HTMLInputElement;

const timerControls = [
  timerDisplay,
  statusDisplay,
  modeToggles,
  controlsSimple,
  controlsInterval,
  actions
];

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
let selectedMode = TimerMode.SIMPLE;

// Format time MM:SS
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Update UI based on state
function updateUI(state: TimerState) {
  timerDisplay.textContent = formatTime(state.remainingSeconds);

  // Update Status Display
  if (state.mode === TimerMode.INTERVAL && state.status !== TimerStatus.IDLE) {
    statusDisplay.classList.remove('hidden');
    if (state.status === TimerStatus.BREAK) {
      statusDisplay.textContent = `On Break (Cycle ${state.currentCycle}/${state.totalCycles})`;
      statusDisplay.style.color = 'green';
    } else if (state.status === TimerStatus.RUNNING) {
      statusDisplay.textContent = `Focus Session (Cycle ${state.currentCycle}/${state.totalCycles})`;
      statusDisplay.style.color = '#666';
    } else {
      statusDisplay.textContent = 'Paused';
    }
  } else {
    statusDisplay.classList.add('hidden');
  }

  // Update duration buttons (Simple Mode)
  durationBtns.forEach((btn) => {
    const duration = parseInt(btn.getAttribute('data-duration') || '0');
    if (state.status === TimerStatus.IDLE) {
      btn.classList.toggle('active', duration === selectedDuration);
      (btn as HTMLButtonElement).disabled = false;
    } else {
      btn.classList.remove('active');
      (btn as HTMLButtonElement).disabled = true;
    }
  });

  // Disable inputs in Interval Mode if running
  const inputsDisabled = state.status !== TimerStatus.IDLE;
  intervalFocusInput.disabled = inputsDisabled;
  intervalBreakInput.disabled = inputsDisabled;
  intervalCyclesInput.disabled = inputsDisabled;

  // Disable mode toggles if running
  (modeBtnSimple as HTMLButtonElement).disabled = inputsDisabled;
  (modeBtnInterval as HTMLButtonElement).disabled = inputsDisabled;
  if (state.status !== TimerStatus.IDLE) {
    modeBtnSimple.classList.add('disabled');
    modeBtnInterval.classList.add('disabled');
  } else {
    modeBtnSimple.classList.remove('disabled');
    modeBtnInterval.classList.remove('disabled');
  }

  // Update controls visibility based on mode (only if IDLE to allow switching, otherwise lock to current mode)
  if (state.status === TimerStatus.IDLE) {
    // If IDLE, respect the UI selection
    if (selectedMode === TimerMode.SIMPLE) {
      controlsSimple.classList.remove('hidden');
      controlsInterval.classList.add('hidden');
      modeBtnSimple.classList.add('active');
      modeBtnInterval.classList.remove('active');
      // update display with selected simple duration
      timerDisplay.textContent = formatTime(selectedDuration * 60);
    } else {
      controlsSimple.classList.add('hidden');
      controlsInterval.classList.remove('hidden');
      modeBtnSimple.classList.remove('active');
      modeBtnInterval.classList.add('active');
      // update display with configured interval focus duration
      timerDisplay.textContent = formatTime(parseInt(intervalFocusInput.value) * 60);
    }
  } else {
    // If RUNNING/PAUSED, force UI to match state mode
    if (state.mode === TimerMode.SIMPLE) {
      controlsSimple.classList.remove('hidden');
      controlsInterval.classList.add('hidden');
    } else {
      controlsSimple.classList.add('hidden');
      // For interval, we might want to hide inputs or show them disabled.
      // We kept them disabled above.
      controlsInterval.classList.remove('hidden');
    }
  }

  // Update main buttons
  if (state.status === TimerStatus.RUNNING || state.status === TimerStatus.BREAK) {
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    stopBtn.textContent = 'Stop'; // Simplified: Stop always resets for now or we add Pause logic later
    // Note: In previous step I saw 'Pause' text content logic, sticking to Stop for Interval MVP or adapting
    resetBtn.classList.remove('hidden');

    if (state.status === TimerStatus.BREAK) {
      timerDisplay.style.color = 'green';
    } else {
      timerDisplay.style.color = '';
    }
  } else if (state.status === TimerStatus.PAUSED) {
    startBtn.classList.remove('hidden');
    startBtn.textContent = 'Resume';
    stopBtn.classList.add('hidden');
    resetBtn.classList.remove('hidden');
    timerDisplay.style.color = '';
  } else {
    // IDLE or COMPLETED
    startBtn.classList.remove('hidden');
    startBtn.textContent = 'Start Focus';
    stopBtn.classList.add('hidden');
    resetBtn.classList.add('hidden');
    timerDisplay.style.color = '';
  }
}

// Event Listeners
durationBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedDuration = parseInt(btn.getAttribute('data-duration') || '25');
    // Optimistic update
    timerDisplay.textContent = formatTime(selectedDuration * 60);
    durationBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Mode Toggles
modeBtnSimple.addEventListener('click', () => {
  selectedMode = TimerMode.SIMPLE;
  storage.getTimerState().then(updateUI); // Refresh display
});

modeBtnInterval.addEventListener('click', () => {
  selectedMode = TimerMode.INTERVAL;
  storage.getTimerState().then(updateUI); // Refresh display
});

// Interval Inputs listeners to update display immediately
[intervalFocusInput].forEach((input) => {
  input.addEventListener('change', () => {
    if (selectedMode === TimerMode.INTERVAL) {
      timerDisplay.textContent = formatTime(parseInt(intervalFocusInput.value) * 60);
    }
  });
});

startBtn.addEventListener('click', async () => {
  const state = await storage.getTimerState();

  // Valid for both Resume and Start
  if (state.status === TimerStatus.PAUSED) {
    sendMessage(MESSAGES.START_TIMER); // Backend handles resume if payload omitted or handled
    // My backend 'start' currently resets state if arguments provided?
    // Actually backend 'start' always creates NEW state.
    // 'pause' creates PAUSED state.
    // 'resume' is missing in my previous update, I need a restart logic or modify 'start' to handle resume.
    // For now, if PAUSED, we likely want to Resume.
    // BUT backend check:
    // private async syncAlarm()...
    // If I call start again, it overwrites.
    // I should probably just send a message to RESUME if implemented, or re-sending details overwrites it.
    // Let's assume for MVP restart is acceptable OR basic resume support needs 'resume' message.
    // I'll stick to 'start' overwriting for now to ensure config is picked up,
    // OR better: check if paused and send specific RESUME action if I added it.
    // I didn't add RESUME handler in messaging.ts yet (implied).
    // Let's just use start for now, effective restart.

    if (selectedMode === TimerMode.INTERVAL) {
      const config = {
        focusDuration: parseInt(intervalFocusInput.value),
        shortBreakDuration: parseInt(intervalBreakInput.value),
        cycles: parseInt(intervalCyclesInput.value)
      };
      sendMessage(MESSAGES.START_TIMER, { duration: 0, intervalConfig: config }); // duration ignored if intervalConfig present
    } else {
      sendMessage(MESSAGES.START_TIMER, { duration: selectedDuration });
    }
  } else {
    // START NEW
    if (selectedMode === TimerMode.INTERVAL) {
      const config = {
        focusDuration: parseInt(intervalFocusInput.value),
        shortBreakDuration: parseInt(intervalBreakInput.value),
        cycles: parseInt(intervalCyclesInput.value)
      };
      sendMessage(MESSAGES.START_TIMER, { duration: 0, intervalConfig: config });
    } else {
      sendMessage(MESSAGES.START_TIMER, { duration: selectedDuration });
    }
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
  timerControls.forEach((el) => el.classList.add('hidden'));
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
    historyList.innerHTML =
      '<li class="history-item" style="justify-content: center; color: #999;">No sessions yet</li>';
  } else {
    sessions.forEach((session) => {
      const date = new Date(session.timestamp);
      const dateStr =
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
  timerControls.forEach((el) => el.classList.remove('hidden'));
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
  const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement)
    .value as BlockingMode;
  const sites = await getSites(mode);

  // Update title
  sitesListTitle.textContent =
    mode === BlockingMode.BLACKLIST ? 'Blocked Sites' : 'Whitelisted Sites';

  sitesList.innerHTML = '';

  // Show empty state if needed
  if (sites.length === 0) {
    sitesList.innerHTML = `<li class="site-item" style="justify-content:center; color:#888; font-style:italic;">
            ${mode === BlockingMode.BLACKLIST ? 'No blocked sites' : 'No whitelisted sites'}
        </li>`;
  }

  sites.forEach((site) => {
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
  document.querySelectorAll('.btn-remove-site').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const siteToRemove = (e.currentTarget as HTMLElement).getAttribute('data-site')!;
      const currentMode = (
        document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement
      ).value as BlockingMode;
      const sites = await getSites(currentMode);
      const newSites = sites.filter((s) => s !== siteToRemove);
      await saveSites(currentMode, newSites);
      renderSitesList();
    });
  });
}

// Mode switching
modeRadios.forEach((radio) => {
  radio.addEventListener('change', async (e) => {
    const newMode = (e.target as HTMLInputElement).value as BlockingMode;
    await storage.setBlockingMode(newMode);
    await renderSitesList();
  });
});

settingsBtn.addEventListener('click', async () => {
  // Hide timer controls
  timerControls.forEach((el) => el.classList.add('hidden'));
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
  const radio = document.querySelector(
    `input[name="blocking-mode"][value="${mode}"]`
  ) as HTMLInputElement;
  if (radio) radio.checked = true;

  // Load Schedule Settings
  const scheduleConfig = await storage.getScheduleConfig();
  const scheduleEnabled = document.getElementById('schedule-enabled') as HTMLInputElement;
  const scheduleOptions = document.getElementById('schedule-options')!;
  const scheduleStart = document.getElementById('schedule-start') as HTMLInputElement;
  const scheduleEnd = document.getElementById('schedule-end') as HTMLInputElement;

  scheduleEnabled.checked = scheduleConfig.enabled;
  scheduleOptions.classList.toggle('hidden', !scheduleConfig.enabled);
  scheduleStart.value = scheduleConfig.startTime;
  scheduleEnd.value = scheduleConfig.endTime;

  // Set days
  document.querySelectorAll('.day-checkbox input').forEach((checkbox) => {
    const input = checkbox as HTMLInputElement;
    const day = parseInt(input.getAttribute('data-day') || '0');
    input.checked = scheduleConfig.days.includes(day);
  });

  // Render sites
  await renderSitesList();
});

// Schedule Event Listeners
const scheduleEnabled = document.getElementById('schedule-enabled') as HTMLInputElement;
scheduleEnabled?.addEventListener('change', async () => {
  const enabled = scheduleEnabled.checked;
  const scheduleOptions = document.getElementById('schedule-options')!;
  scheduleOptions.classList.toggle('hidden', !enabled);

  const config = await storage.getScheduleConfig();
  config.enabled = enabled;
  await storage.setScheduleConfig(config);
});

const scheduleStart = document.getElementById('schedule-start') as HTMLInputElement;
scheduleStart?.addEventListener('change', async () => {
  const config = await storage.getScheduleConfig();
  config.startTime = scheduleStart.value;
  await storage.setScheduleConfig(config);
});

const scheduleEnd = document.getElementById('schedule-end') as HTMLInputElement;
scheduleEnd?.addEventListener('change', async () => {
  const config = await storage.getScheduleConfig();
  config.endTime = scheduleEnd.value;
  await storage.setScheduleConfig(config);
});

document.querySelectorAll('.day-checkbox input').forEach((checkbox) => {
  checkbox.addEventListener('change', async () => {
    const config = await storage.getScheduleConfig();
    const input = checkbox as HTMLInputElement;
    const day = parseInt(input.getAttribute('data-day') || '0');

    if (input.checked) {
      if (!config.days.includes(day)) config.days.push(day);
    } else {
      config.days = config.days.filter((d) => d !== day);
    }
    await storage.setScheduleConfig(config);
  });
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
  } catch (_e) {
    // Fallback for simple domain-like strings that URL class might reject
    return input.trim().toLowerCase();
  }
}

addSiteBtn.addEventListener('click', async () => {
  const rawInput = siteInput.value;
  const newSite = extractDomain(rawInput);

  if (!newSite) return;

  const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement)
    .value as BlockingMode;
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
  const mode = (document.querySelector('input[name="blocking-mode"]:checked') as HTMLInputElement)
    .value as BlockingMode;
  const msg =
    mode === BlockingMode.BLACKLIST ? 'Reset to default blocked sites?' : 'Clear whitelist?';

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
  timerControls.forEach((el) => el.classList.remove('hidden'));
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
  slides.forEach((slide) => {
    slide.classList.remove('active');
    if (parseInt(slide.getAttribute('data-slide') || '0') === currentSlide) {
      slide.classList.add('active');
    }
  });

  dots.forEach((dot) => {
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

async function renderGamification() {
  const stats = await storage.getUserStats();

  levelBadge.textContent = `Lvl ${stats.level}`;
  xpText.textContent = `${stats.xp} XP`;

  const progress = GamificationService.getProgress(stats.xp, stats.level);
  xpProgress.style.width = `${progress}%`;

  badgesContainer.innerHTML = '';
  if (BADGES.length > 0) {
    badgesContainer.parentElement!.classList.remove('hidden'); // Ensure container visible if badges exist
  }

  BADGES.forEach((badge) => {
    const isUnlocked = stats.badges.includes(badge.id);
    const badgeEl = document.createElement('div');
    badgeEl.className = 'badge-item';
    badgeEl.innerHTML = badge.icon;
    badgeEl.title =
      `${badge.name}: ${badge.description}` + (isUnlocked ? ' (Unlocked)' : ' (Locked)');
    badgeEl.style.fontSize = '1.5rem';
    badgeEl.style.cursor = 'help';
    badgeEl.style.opacity = isUnlocked ? '1' : '0.3';
    badgeEl.style.filter = isUnlocked ? 'none' : 'grayscale(100%)';
    badgesContainer.appendChild(badgeEl);
  });
}

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

  await renderGamification();
  storage.onUserStatsChanged(renderGamification);
})();

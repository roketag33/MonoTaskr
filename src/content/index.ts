import { storage } from '../shared/storage';
import { TimerStatus, TimerState, BlockingMode } from '../shared/types';

console.log('MonoTaskr content script loaded.');

// Settings state
let currentBlockedSites: string[] = [];
let currentWhitelistedSites: string[] = [];
let currentBlockingMode: BlockingMode = BlockingMode.BLACKLIST;
let shouldBeBlocked = false;

// Title management state
let originalTitle: string | null = null;

// Check if current site should be blocked based on mode and lists
function checkBlockingStatus(hostname: string): boolean {
  if (currentBlockingMode === BlockingMode.BLACKLIST) {
    return currentBlockedSites.some(domain => hostname.includes(domain));
  } else {
    // Whitelist mode: Block if NOT in whitelist
    // Exception: Always allow internal pages or empty hostname
    if (!hostname) return false;

    // Check if hostname matches any whitelisted domain
    const isWhitelisted = currentWhitelistedSites.some(domain => hostname.includes(domain));
    return !isWhitelisted;
  }
}

function updateBlockingStatus(hostname: string, updateOverlay: (state?: TimerState) => void) {
  const wasShouldBeBlocked = shouldBeBlocked;
  shouldBeBlocked = checkBlockingStatus(hostname);

  // If status changed, we need to re-evaluate the overlay
  if (wasShouldBeBlocked !== shouldBeBlocked) {
    // We need to fetch timer state to know if we should actually show the overlay
    storage.getTimerState().then((state) => {
      updateOverlay(state);
    });
  }
}

function initBlocking() {
  let overlay: HTMLElement | null = null;

  const createOverlay = () => {
    const container = document.createElement('div');
    container.id = 'monotaskr-overlay-container';
    const shadow = container.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
      }
      .overlay {
        width: 100%;
        height: 100%;
        background-color: #e74c3c; /* Angry Red */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
        color: white;
        text-align: center;
        user-select: none;
      }
      .content {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      h1 {
        font-size: 5rem;
        margin: 0;
        text-transform: uppercase;
        text-shadow: 4px 4px 0px #c0392b;
      }
      .emoji {
        font-size: 8rem;
        margin-bottom: 2rem;
      }
      p {
        font-size: 2rem;
        margin-top: 1rem;
        font-weight: bold;
      }
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
      }
    `;

    const content = document.createElement('div');
    content.className = 'overlay';
    content.innerHTML = `
      <div class="content">
        <div class="emoji">😠</div>
        <h1>NON !</h1>
        <p>Tu devrais être en train de travailler !</p>
        <p>Ferme cet onglet tout de suite.</p>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(content);
    return container;
  };

  const updateBlocking = (state?: TimerState) => {
    // We need state to know if running. If not provided, fetch it?
    // Actually, expecting calling code to provide it is better to avoid race conditions or multiple fetches.
    // The timer listener provides it.
    if (!state) return;

    if (state.status === TimerStatus.RUNNING && shouldBeBlocked) {
      if (!overlay) {
        overlay = createOverlay();
        if (document.body) {
          document.body.appendChild(overlay);
          document.body.style.overflow = 'hidden';
        } else {
          document.documentElement.appendChild(overlay);
          document.documentElement.style.overflow = 'hidden';
        }
      }
    } else {
      if (overlay) {
        overlay.remove();
        overlay = null;
        if (document.body) document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }
  };

  return updateBlocking;
}

// Initialize
(async () => {
  // Load all settings
  const [blockedSites, whitelistedSites, blockingMode] = await Promise.all([
    storage.getBlockedSites(),
    storage.getWhitelistedSites(),
    storage.getBlockingMode()
  ]);

  currentBlockedSites = blockedSites;
  currentWhitelistedSites = whitelistedSites;
  currentBlockingMode = blockingMode;

  const currentHostname = window.location.hostname;
  shouldBeBlocked = checkBlockingStatus(currentHostname);

  // Initialize blocking overlay logic
  const updateOverlay = initBlocking();

  // Initial check with timer state
  const timerState = await storage.getTimerState();
  updateOverlay(timerState);

  // Subscribe to timer changes
  storage.onTimerStateChanged(updateOverlay);

  // Listen for changes
  storage.onBlockedSitesChanged((newSites) => {
    currentBlockedSites = newSites;
    updateBlockingStatus(currentHostname, updateOverlay);
  });

  storage.onWhitelistedSitesChanged((newSites) => {
    currentWhitelistedSites = newSites;
    updateBlockingStatus(currentHostname, updateOverlay);
  });

  storage.onBlockingModeChanged((newMode) => {
    currentBlockingMode = newMode;
    updateBlockingStatus(currentHostname, updateOverlay);
  });
})();

// Listen for title updates from background service
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'UPDATE_TITLE' && message.title) {
    if (originalTitle === null) {
      originalTitle = document.title;
    }
    document.title = message.title;
  } else if (message.action === 'RESET_TITLE') {
    if (originalTitle !== null) {
      document.title = originalTitle;
      originalTitle = null;
    }
  }
});

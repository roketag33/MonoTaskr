import { storage } from '../shared/storage';
import { TimerStatus, TimerState } from '../shared/types';
import { BLOCKED_DOMAINS } from '../shared/constants';

console.log('MonoTaskr content script loaded.');

const currentHostname = window.location.hostname;
const isBlocked = BLOCKED_DOMAINS.some(domain => currentHostname.includes(domain));

if (isBlocked) {
  console.log(`MonoTaskr: ${currentHostname} is in the block list.`);
  initBlocking();
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
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #2c3e50;
        z-index: 2147483647; /* Max z-index */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
      }
      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      p {
        font-size: 1.5rem;
        opacity: 0.8;
      }
    `;

    const content = document.createElement('div');
    content.innerHTML = `
      <h1>Focus Mode Active</h1>
      <p>This site is blocked while the timer is running.</p>
      <p>Get back to your task!</p>
    `;

    shadow.appendChild(style);
    shadow.appendChild(content);
    return container;
  };

  const updateBlocking = (state: TimerState) => {
    if (state.status === TimerStatus.RUNNING) {
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

  // Initial check
  storage.getTimerState().then(updateBlocking);

  // Subscribe to changes
  storage.onTimerStateChanged(updateBlocking);
}


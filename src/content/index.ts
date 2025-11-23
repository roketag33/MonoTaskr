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
        background-color: #e74c3c; /* Angry Red */
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Playful font */
        color: white;
        text-align: center;
        user-select: none;
      }
      .container {
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
    content.className = 'container';
    content.innerHTML = `
      <div class="emoji">😠</div>
      <h1>NON !</h1>
      <p>Tu devrais être en train de travailler !</p>
      <p>Ferme cet onglet tout de suite.</p>
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


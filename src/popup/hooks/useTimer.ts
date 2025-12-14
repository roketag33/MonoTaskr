import { useState, useEffect } from 'react';
import { TimerState, DEFAULT_TIMER_STATE } from '../../shared/types';
import { storage } from '../../shared/storage';

export const useTimer = () => {
  const [state, setState] = useState<TimerState>(DEFAULT_TIMER_STATE);

  useEffect(() => {
    // Initial fetch
    const fetchState = async () => {
      const s = await storage.getTimerState();
      setState(s);
    };
    fetchState();

    // Listener
    const listener = (newState: TimerState) => {
      setState(newState);
    };

    storage.onTimerStateChanged(listener);

    // Cleanup (though we might not need to remove listener if the component is mounted forever, but good practice)
    // Note: storage.ts doesn't expose removeListener in the helper currently,
    // but it registers chrome.storage.onChanged.
    // Since the current implementation of onTimerStateChanged adds a new anonymous function every time,
    // we can't easily remove it without refactoring storage.ts to return the wrapper reference.
    // For now, in a popup, it's acceptable as the popup is short-lived.

    return () => {
      // Placeholder: Ideally we should unsubscribe.
    };
  }, []);

  return state;
};

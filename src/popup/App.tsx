import React, { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useTheme } from './hooks/useTheme';
import { TimerView } from './components/TimerView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { OnboardingView } from './components/OnboardingView';
import { storage } from '../shared/storage';
import { MESSAGES } from '../shared/messaging';
import { I18nService } from '../shared/i18n.service';

type View = 'timer' | 'history' | 'settings';

const App: React.FC = () => {
  useTheme();
  const timerState = useTimer();
  const [currentView, setCurrentView] = useState<View>('timer');
  const [isOnboarding, setIsOnboarding] = useState<boolean | null>(null);

  // Initial check for onboarding
  useEffect(() => {
    storage.getOnboardingCompleted().then((completed) => {
      setIsOnboarding(!completed);
    });
  }, []);

  const handleStart = (duration: number) => {
    chrome.runtime.sendMessage({
      type: MESSAGES.START_TIMER,
      payload: { duration }
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: MESSAGES.PAUSE_TIMER });
  };

  const handleReset = () => {
    chrome.runtime.sendMessage({ type: MESSAGES.RESET_TIMER });
  };

  const handleCompleteOnboarding = async () => {
    await storage.setOnboardingCompleted(true);
    setIsOnboarding(false);
  };

  if (isOnboarding === null) return null; // Loading
  if (isOnboarding) return <OnboardingView onComplete={handleCompleteOnboarding} />;

  return (
    <div id="app">
      <header>
        <h1>{I18nService.getMessage('appName')}</h1>
      </header>

      <main>
        {currentView === 'timer' && (
          <TimerView
            state={timerState}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
          />
        )}

        {currentView === 'settings' && <SettingsView onBack={() => setCurrentView('timer')} />}

        {currentView === 'history' && <HistoryView onBack={() => setCurrentView('timer')} />}

        {currentView === 'timer' && (
          <div className="bottom-actions">
            <button className="text-btn" onClick={() => setCurrentView('settings')}>
              {I18nService.getMessage('btnSettings')}
            </button>
            <button className="text-btn" onClick={() => setCurrentView('history')}>
              {I18nService.getMessage('btnViewHistory')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

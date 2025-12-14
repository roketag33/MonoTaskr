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
import { Button } from './components/ui/button';
import { Settings, History, Clock, ArrowLeft } from 'lucide-react';

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

  if (isOnboarding === null)
    return (
      <div className="p-4 flex items-center justify-center h-[500px] text-muted-foreground">
        Loading...
      </div>
    );
  if (isOnboarding) return <OnboardingView onComplete={handleCompleteOnboarding} />;

  return (
    <div className="w-[360px] min-h-[500px] bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="p-4 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {I18nService.getMessage('appName')}
        </h1>
        {currentView !== 'timer' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('timer')}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {I18nService.getMessage('btnBack')}
          </Button>
        )}
      </header>

      <main className="flex-1 p-4 relative">
        {currentView === 'timer' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <TimerView
              state={timerState}
              onStart={handleStart}
              onStop={handleStop}
              onReset={handleReset}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 hover:bg-muted"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="w-4 h-4" />
                {I18nService.getMessage('btnSettings')}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 hover:bg-muted"
                onClick={() => setCurrentView('history')}
              >
                <History className="w-4 h-4" />
                {I18nService.getMessage('btnViewHistory')}
              </Button>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <SettingsView onBack={() => setCurrentView('timer')} />
          </div>
        )}

        {currentView === 'history' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <HistoryView onBack={() => setCurrentView('timer')} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

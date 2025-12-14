import React, { useEffect, useState } from 'react';
import { TimerState, TimerStatus, TimerMode } from '../../shared/types';
import { I18nService } from '../../shared/i18n.service';
import { MESSAGES } from '../../shared/messaging';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimerViewProps {
  state: TimerState;
  onStart: (duration: number) => void;
  onStop: () => void;
  onReset: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ state, onStart, onStop, onReset }) => {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [selectedMode, setSelectedMode] = useState<TimerMode>(TimerMode.SIMPLE);

  useEffect(() => {
    if (state.mode) setSelectedMode(state.mode);
  }, [state.mode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isRunning = state.status === TimerStatus.RUNNING;
  const isPaused = state.status === TimerStatus.PAUSED;
  const isBreak = state.status === TimerStatus.BREAK;
  const isIdle = state.status === TimerStatus.IDLE;

  const handleStartClick = () => {
    if (isPaused) {
      onStart(state.duration);
    } else {
      // New session
      if (selectedMode === TimerMode.INTERVAL) {
        chrome.runtime.sendMessage({
          type: MESSAGES.UPDATE_TIMER_MODE,
          payload: { mode: TimerMode.INTERVAL }
        });
      }
      onStart(selectedDuration);
    }
  };

  const handleModeToggle = () => {
    const newMode = selectedMode === TimerMode.SIMPLE ? TimerMode.INTERVAL : TimerMode.SIMPLE;
    setSelectedMode(newMode);
    chrome.runtime.sendMessage({
      type: MESSAGES.UPDATE_TIMER_MODE,
      payload: { mode: newMode }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
      {/* Mode Switcher */}
      {isIdle && (
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-all font-medium',
              selectedMode === TimerMode.SIMPLE
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => handleModeToggle()}
          >
            Simple
          </button>
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-all font-medium',
              selectedMode === TimerMode.INTERVAL
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => handleModeToggle()}
          >
            Intervals
          </button>
        </div>
      )}

      {/* Timer Display */}
      <Card className="w-full border-2 border-primary/10 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Status Badge */}
          <Badge
            variant={isBreak ? 'secondary' : 'default'}
            className="mb-4 text-xs tracking-wider uppercase"
          >
            {isIdle
              ? I18nService.getMessage('statusIdle')
              : isBreak
                ? I18nService.getMessage('statusOnBreak')
                : I18nService.getMessage('statusFocusSession')}
          </Badge>

          {/* Time */}
          <div
            className={cn(
              'text-7xl font-bold tabular-nums tracking-tighter transition-colors duration-500',
              isBreak ? 'text-secondary-foreground' : 'text-primary'
            )}
          >
            {formatTime(state.remainingSeconds)}
          </div>

          {/* Cycle Info (Interval Mode) */}
          {(state.mode === TimerMode.INTERVAL || selectedMode === TimerMode.INTERVAL) && (
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              {I18nService.getMessage('cycleCount', [
                state.currentCycle.toString(),
                state.totalCycles.toString()
              ])}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full">
        {!isRunning && !isPaused && (
          <div className="grid grid-cols-3 gap-2 w-full">
            {[25, 45, 60].map((mins) => (
              <Button
                key={mins}
                variant={selectedDuration === mins ? 'default' : 'outline'}
                onClick={() => setSelectedDuration(mins)}
                className="h-12 text-lg font-medium"
              >
                {mins}
              </Button>
            ))}
          </div>
        )}

        {(isRunning || isPaused || isBreak) && (
          <div className="flex gap-4 w-full justify-center">
            {isRunning ? (
              <Button size="lg" variant="destructive" className="w-full h-14" onClick={onStop}>
                <Pause className="mr-2 h-6 w-6" />
                {I18nService.getMessage('btnPause')}
              </Button>
            ) : (
              <Button size="lg" className="w-full h-14" onClick={handleStartClick}>
                <Play className="mr-2 h-6 w-6" />
                {I18nService.getMessage('btnResume')}
              </Button>
            )}

            <Button size="icon" variant="outline" className="h-14 w-14" onClick={onReset}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {isIdle && (
        <Button
          size="lg"
          className="w-full h-14 text-lg shadow-primary/25 shadow-xl hover:shadow-primary/40 transition-all"
          onClick={handleStartClick}
        >
          {I18nService.getMessage('btnStart')}
        </Button>
      )}
    </div>
  );
};

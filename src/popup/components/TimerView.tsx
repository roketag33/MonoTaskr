import React from 'react';
import { TimerState, TimerStatus, TimerMode } from '../../shared/types';
import { I18nService } from '../../shared/i18n.service';

interface TimerViewProps {
  state: TimerState;
  onStart: (duration: number) => void;
  onStop: () => void;
  onReset: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const TimerView: React.FC<TimerViewProps> = ({ state, onStart, onStop, onReset }) => {
  const isRunning = state.status === TimerStatus.RUNNING || state.status === TimerStatus.BREAK;
  const isPaused = state.status === TimerStatus.PAUSED;
  const isBreak = state.status === TimerStatus.BREAK;

  // Simple mode duration selection
  const [selectedDuration, setSelectedDuration] = React.useState(25);

  const handleStart = () => {
    if (isPaused) {
      onStart(0); // 0 or whatever to signal resume/start
    } else {
      onStart(selectedDuration);
    }
  };

  return (
    <div className="timer-view">
      <div id="timer-display" style={{ color: isBreak ? 'green' : '' }}>
        {formatTime(state.remainingSeconds)}
      </div>

      {/* Status Badge */}
      {isRunning && (
        <div
          id="status-display"
          style={{ textAlign: 'center', color: isBreak ? 'green' : '#666', marginBottom: '10px' }}
        >
          {isBreak
            ? `${I18nService.getMessage('statusBreak')} (${I18nService.getMessage('cycle')} ${state.currentCycle}/${state.totalCycles})`
            : `${I18nService.getMessage('statusFocusSession')} (${state.mode === TimerMode.INTERVAL ? `(${I18nService.getMessage('cycle')} ${state.currentCycle}/${state.totalCycles})` : ''})`}
        </div>
      )}

      {isPaused && (
        <div
          id="status-display"
          style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}
        >
          {I18nService.getMessage('statusPaused')}
        </div>
      )}

      {/* Duration Selection (Simple Mode Only & IDLE) */}
      {!isRunning && !isPaused && state.mode === TimerMode.SIMPLE && (
        <div id="controls-simple" className="controls-group">
          {[25, 45, 60].map((duration) => (
            <button
              key={duration}
              className={`duration-btn ${selectedDuration === duration ? 'active' : ''}`}
              onClick={() => setSelectedDuration(duration)}
            >
              {duration}m
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div id="actions" className="actions-group">
        {!isRunning ? (
          <button className="primary-btn" onClick={handleStart}>
            {isPaused
              ? I18nService.getMessage('btnResume')
              : I18nService.getMessage('btnStartFocus')}
          </button>
        ) : (
          <button className="secondary-btn" onClick={onStop}>
            {I18nService.getMessage('btnStop')}
          </button>
        )}

        {(isRunning || isPaused) && (
          <button className="danger-btn" onClick={onReset}>
            {I18nService.getMessage('btnReset')}
          </button>
        )}
      </div>
    </div>
  );
};

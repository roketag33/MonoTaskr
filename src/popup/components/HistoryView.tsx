import React, { useEffect, useState } from 'react';
import { I18nService } from '../../shared/i18n.service';
import { storage } from '../../shared/storage';
import { Session } from '../../shared/types';

interface HistoryViewProps {
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ count: 0, totalMinutes: 0 });

  useEffect(() => {
    const load = async () => {
      setSessions(await storage.getSessions());
      setStats(await storage.getDailyStats());
    };
    load();
  }, []);

  return (
    <div id="history-view">
      <h2>{I18nService.getMessage('historyTitle')}</h2>

      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-value">{stats.count}</span>
          <span className="stat-label">{I18nService.getMessage('statsSessionsToday')}</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.totalMinutes}</span>
          <span className="stat-label">{I18nService.getMessage('statsMinutesFocus')}</span>
        </div>
      </div>

      <ul id="history-list">
        {sessions.length === 0 ? (
          <li className="history-item" style={{ justifyContent: 'center', color: '#999' }}>
            {I18nService.getMessage('historyEmpty')}
          </li>
        ) : (
          sessions.map((session) => (
            <li key={session.id} className="history-item">
              <span className="history-date">
                {new Date(session.timestamp).toLocaleDateString()}{' '}
                {new Date(session.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="history-duration">{Math.round(session.duration / 60)}m</span>
            </li>
          ))
        )}
      </ul>

      <button className="secondary-btn" onClick={onBack}>
        {I18nService.getMessage('btnBack')}
      </button>
    </div>
  );
};

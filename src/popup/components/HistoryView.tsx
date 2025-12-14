import React, { useEffect, useState } from 'react';
import { I18nService } from '../../shared/i18n.service';
import { storage } from '../../shared/storage';
import { Session } from '../../shared/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, BarChart3 } from 'lucide-react';

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
    <div className="space-y-6 pb-4">
      <h2 className="text-2xl font-bold">{I18nService.getMessage('historyTitle')}</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 bg-primary/5">
            <span className="text-3xl font-bold text-primary">{stats.count}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1 text-center">
              {I18nService.getMessage('statsSessionsToday')}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 bg-primary/5">
            <span className="text-3xl font-bold text-primary">{stats.totalMinutes}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1 text-center">
              {I18nService.getMessage('statsMinutesFocus')}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            {I18nService.getMessage('historyRecentSessions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 overflow-y-auto pr-2 space-y-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Clock className="w-8 h-8 opacity-20" />
              <p>{I18nService.getMessage('historyEmpty')}</p>
            </div>
          ) : (
            sessions
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="w-4 h-4 text-primary" />
                      {new Date(session.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm font-bold">
                    {Math.round(session.duration / 60)}m
                  </Badge>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <Button variant="ghost" className="w-full" onClick={onBack}>
        {I18nService.getMessage('btnBack')}
      </Button>
    </div>
  );
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from './export.service';
import { Session } from './types';

describe('Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and document.createElement for download testing if needed
    // But mostly we test the string generation here
  });

  it('should generate valid JSON string from data', () => {
    const data = {
      sessions: [],
      settings: { theme: 'dark' }
    };
    const json = ExportService.generateJSON(data);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(data);
  });

  it('should generate valid CSV string from sessions', () => {
    const sessions: Session[] = [
      {
        id: '1',
        startTime: 1600000000000,
        duration: 25 * 60,
        completed: true,
        timestamp: 1600000000000
      },
      {
        id: '2',
        startTime: 1600001000000,
        duration: 10 * 60,
        completed: false,
        timestamp: 1600001000000
      }
    ];

    const csv = ExportService.generateCSV(sessions);

    // Check headers
    expect(csv).toContain('Date,Duration (min),Completed');

    // Check rows (dates will depend on formatting, but duration and completed status should be clear)
    expect(csv).toContain('25,Yes');
    expect(csv).toContain('10,No');
  });

  it('should format date correctly in CSV', () => {
    const timestamp = new Date('2023-01-01T10:00:00Z').getTime();
    const sessions: Session[] = [
      { id: '1', startTime: timestamp, duration: 60, completed: true, timestamp: timestamp }
    ];
    const csv = ExportService.generateCSV(sessions);
    // Simple check that it contains the year/month/day
    expect(csv).toContain('2023');
  });
});

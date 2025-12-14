import { describe, it, expect } from 'vitest';
import { ScheduleService } from './schedule.service';
import { ScheduleConfig } from '../shared/types';

describe('ScheduleService', () => {
  describe('isBlockingTime', () => {
    const baseConfig: ScheduleConfig = {
      enabled: true,
      days: [1, 2, 3, 4, 5], // Mon-Fri
      startTime: '09:00',
      endTime: '17:00'
    };

    it('should return false if schedule is disabled', () => {
      const config = { ...baseConfig, enabled: false };
      const date = new Date('2023-01-02T10:00:00'); // Monday 10:00
      expect(ScheduleService.isBlockingTime(config, date)).toBe(false);
    });

    it('should return true if within scheduled days and hours', () => {
      const date = new Date('2023-01-02T10:00:00'); // Monday 10:00 (inside)
      expect(ScheduleService.isBlockingTime(baseConfig, date)).toBe(true);
    });

    it('should return false if outside scheduled days', () => {
      const date = new Date('2023-01-01T10:00:00'); // Sunday 10:00
      expect(ScheduleService.isBlockingTime(baseConfig, date)).toBe(false);
    });

    it('should return false if before start time', () => {
      const date = new Date('2023-01-02T08:59:00'); // Monday 08:59
      expect(ScheduleService.isBlockingTime(baseConfig, date)).toBe(false);
    });

    it('should return false if after end time', () => {
      const date = new Date('2023-01-02T17:01:00'); // Monday 17:01
      expect(ScheduleService.isBlockingTime(baseConfig, date)).toBe(false);
    });

    it('should handle time check correctly regardless of date', () => {
      // Check edge cases roughly
      const dateStart = new Date('2023-01-02T09:00:00'); // Monday 09:00
      expect(ScheduleService.isBlockingTime(baseConfig, dateStart)).toBe(true);

      const dateEnd = new Date('2023-01-02T17:00:00'); // Monday 17:00 -- inclusive or exclusive?
      // Usually blocking UP TO 17:00 implies 17:00:00 is technically end.
      // Let's say range is [start, end).
      // If startTime=09:00, endTime=17:00, then 17:00 is FREE.
      expect(ScheduleService.isBlockingTime(baseConfig, dateEnd)).toBe(false);
    });
  });
});

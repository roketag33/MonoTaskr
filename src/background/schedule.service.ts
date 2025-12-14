import { ScheduleConfig } from '../shared/types';

export class ScheduleService {
  static isBlockingTime(config: ScheduleConfig, date: Date): boolean {
    if (!config.enabled) {
      return false;
    }

    const currentDay = date.getDay(); // 0 = Sunday
    if (!config.days.includes(currentDay)) {
      return false;
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    const endTotalMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startTotalMinutes && currentMinutes < endTotalMinutes;
  }
}

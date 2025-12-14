import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimerService } from './timer.service';
import { TimerStatus, DEFAULT_TIMER_STATE } from '../shared/types';
import { ScheduleService } from './schedule.service';

// Mock chrome
const chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    },
    onChanged: { addListener: vi.fn() }
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn()
  },
  notifications: {
    create: vi.fn()
  }
};
global.chrome = chrome as any;

// Mock ScheduleService
vi.mock('./schedule.service', () => ({
  ScheduleService: {
    isBlockingTime: vi.fn()
  }
}));

// Mock storage module
vi.mock('../shared/storage', () => ({
  storage: {
    getTimerState: vi.fn(),
    setTimerState: vi.fn(),
    getScheduleConfig: vi.fn()
  }
}));
import { storage } from '../shared/storage';

describe('TimerService Schedule Integration', () => {
  let timerService: TimerService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default storage mocks
    (storage.getTimerState as any).mockResolvedValue({ ...DEFAULT_TIMER_STATE });
    (storage.getScheduleConfig as any).mockResolvedValue({ enabled: true });
    timerService = new TimerService();
  });

  describe('checkSchedule', () => {
    it('should switch to SCHEDULED if isBlockingTime is true and status is IDLE', async () => {
      // Setup
      (storage.getTimerState as any).mockResolvedValue({
        ...DEFAULT_TIMER_STATE,
        status: TimerStatus.IDLE
      });
      (ScheduleService.isBlockingTime as any).mockReturnValue(true);

      // Re-create service to pick up new mock state
      timerService = new TimerService();
      // Wait a tiny bit for init (constructor is not async but init is)
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Execute
      await timerService.checkSchedule();

      // Verify
      expect(storage.setTimerState).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TimerStatus.SCHEDULED
        })
      );
    });

    it('should switch to IDLE if isBlockingTime is false and status is SCHEDULED', async () => {
      // Setup
      (storage.getTimerState as any).mockResolvedValue({
        ...DEFAULT_TIMER_STATE,
        status: TimerStatus.SCHEDULED
      });
      (ScheduleService.isBlockingTime as any).mockReturnValue(false);

      timerService = new TimerService();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Execute
      await timerService.checkSchedule();

      // Verify
      expect(storage.setTimerState).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TimerStatus.IDLE
        })
      );
    });

    it('should NOT change status if RUNNING even if blocking time', async () => {
      // Setup
      (storage.getTimerState as any).mockResolvedValue({
        ...DEFAULT_TIMER_STATE,
        status: TimerStatus.RUNNING
      });
      (ScheduleService.isBlockingTime as any).mockReturnValue(true);

      timerService = new TimerService();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Execute
      await timerService.checkSchedule();

      // Verify
      expect(storage.setTimerState).not.toHaveBeenCalled();
    });
  });
});

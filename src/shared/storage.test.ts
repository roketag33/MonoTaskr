import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from './storage';
import { BlockingMode, TimerStatus, TimerMode } from './types';

// Mock chrome API
const localGet = vi.fn();
const localSet = vi.fn();
const syncGet = vi.fn();
const syncSet = vi.fn();

global.chrome = {
  storage: {
    local: {
      get: localGet,
      set: localSet
    },
    sync: {
      get: syncGet,
      set: syncSet
    },
    onChanged: {
      addListener: vi.fn()
    }
  }
} as any;

describe('Storage Service (Sync vs Local)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // SYNC KEYS TESTS

  it('should save Theme to SYNC storage', async () => {
    await storage.setTheme('dark');
    expect(syncSet).toHaveBeenCalledWith({ theme: 'dark' });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should get Theme from SYNC storage', async () => {
    syncGet.mockResolvedValue({ theme: 'light' });
    const theme = await storage.getTheme();
    expect(syncGet).toHaveBeenCalledWith('theme');
    expect(theme).toBe('light');
  });

  it('should save Blocked Sites to SYNC storage', async () => {
    const sites = ['example.com'];
    await storage.setBlockedSites(sites);
    expect(syncSet).toHaveBeenCalledWith({ blocked_sites: sites });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should save Whitelisted Sites to SYNC storage', async () => {
    const sites = ['good.com'];
    await storage.setWhitelistedSites(sites);
    expect(syncSet).toHaveBeenCalledWith({ whitelisted_sites: sites });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should save Blocking Mode to SYNC storage', async () => {
    await storage.setBlockingMode(BlockingMode.WHITELIST);
    expect(syncSet).toHaveBeenCalledWith({ blocking_mode: BlockingMode.WHITELIST });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should save User Stats to SYNC storage', async () => {
    const stats = {
      totalFocusSeconds: 100,
      xp: 50,
      level: 1,
      badges: [],
      dailyTempAccess: { date: '2023', count: 0 }
    };
    await storage.setUserStats(stats);
    expect(syncSet).toHaveBeenCalledWith({ stats });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should save Schedule Config to SYNC storage', async () => {
    const config = { enabled: true, days: [], startTime: '09:00', endTime: '17:00' };
    await storage.setScheduleConfig(config);
    expect(syncSet).toHaveBeenCalledWith({ schedule: config });
    expect(localSet).not.toHaveBeenCalled();
  });

  it('should save Temp Access Limit to SYNC storage', async () => {
    await storage.setTempAccessLimit(5);
    expect(syncSet).toHaveBeenCalledWith({ temp_access_limit: 5 });
    expect(localSet).not.toHaveBeenCalled();
  });

  // LOCAL KEYS TESTS

  it('should save Timer State to LOCAL storage', async () => {
    const state = {
      status: TimerStatus.RUNNING,
      mode: TimerMode.SIMPLE,
      startTime: Date.now(),
      duration: 25,
      remainingSeconds: 60,
      endTime: Date.now() + 60000,
      currentCycle: 0,
      totalCycles: 1
    };
    await storage.setTimerState(state);
    expect(localSet).toHaveBeenCalledWith({ timer_state: state });
    expect(syncSet).not.toHaveBeenCalled();
  });

  it('should get Timer State from LOCAL storage', async () => {
    localGet.mockResolvedValue({});
    await storage.getTimerState();
    expect(localGet).toHaveBeenCalledWith('timer_state');
  });

  it('should save Sessions to LOCAL storage', async () => {
    // Sessions are complex because getSessions reads first.
    // We'll mock the get to return empty array for simplicity
    localGet.mockResolvedValue({ sessions: [] });

    const session = { id: '1', startTime: 123, duration: 10, completed: true, timestamp: 123 };
    await storage.saveSession(session);

    // Expected: local.set with updated sessions array
    expect(localSet).toHaveBeenCalledWith(expect.objectContaining({ sessions: [session] }));
    expect(syncSet).not.toHaveBeenCalled();
  });

  it('should save Temp Overrides to LOCAL storage', async () => {
    const overrides = { 'site.com': 123 };
    await storage.setTempOverrides(overrides);
    expect(localSet).toHaveBeenCalledWith({ temp_overrides: overrides });
    expect(syncSet).not.toHaveBeenCalled();
  });
});

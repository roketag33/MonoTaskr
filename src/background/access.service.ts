import { storage } from '../shared/storage';

export class AccessService {
  static async requestTempAccess(
    domain: string
  ): Promise<{ authorized: boolean; finalCount?: number }> {
    // 1. Get Settings & Stats
    const stats = await storage.getUserStats();

    // Check date
    const today = new Date().toDateString();
    if (stats.dailyTempAccess.date !== today) {
      stats.dailyTempAccess = { date: today, count: 0 };
    }

    // Check limit
    const limit = await storage.getTempAccessLimit();

    if (stats.dailyTempAccess.count >= limit) {
      return { authorized: false, finalCount: stats.dailyTempAccess.count };
    }

    // Grant access
    stats.dailyTempAccess.count++;
    await storage.setUserStats(stats);

    const overrides = await storage.getTempOverrides();
    // 1 minute (60000 ms)
    overrides[domain] = Date.now() + 60000;

    // Clean up old overrides while we are at it
    const now = Date.now();
    Object.keys(overrides).forEach((key) => {
      if (overrides[key] < now) delete overrides[key];
    });

    await storage.setTempOverrides(overrides);

    return { authorized: true, finalCount: stats.dailyTempAccess.count };
  }
}

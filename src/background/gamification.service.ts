import { UserStats, Badge } from '../shared/types';

export const BADGES: Badge[] = [
  {
    id: 'FIRST_STEP',
    name: 'First Step',
    description: 'Complete your first minute of focus',
    icon: '🌱',
    condition: (stats: UserStats) => stats.xp >= 1
  },
  {
    id: 'FOCUS_NOVICE',
    name: 'Focus Novice',
    description: 'Reach Level 2',
    icon: '🧘',
    condition: (stats: UserStats) => stats.level >= 2
  },
  {
    id: 'FOCUS_MASTER',
    name: 'Focus Master',
    description: 'Reach Level 10',
    icon: '🥋',
    condition: (stats: UserStats) => stats.level >= 10
  }
];

export class GamificationService {
  static calculateLevel(xp: number): number {
    if (xp < 0) return 1;
    // Simple linear progression: Level 1 at 0-59 XP, Level 2 at 60 XP.
    // Level = floor(XP / 60) + 1
    return Math.floor(xp / 60) + 1;
  }

  static getXPForNextLevel(level: number): number {
    return level * 60;
  }

  static getProgress(xp: number, level: number): number {
    const currentLevelXP = (level - 1) * 60;
    const nextLevelXP = level * 60;
    const xpInLevel = xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
  }

  static checkBadges(stats: UserStats): Badge[] {
    const unlockedBadges: Badge[] = [];

    BADGES.forEach((badge) => {
      if (!stats.badges.includes(badge.id)) {
        if (badge.condition && badge.condition(stats)) {
          unlockedBadges.push(badge);
        }
      }
    });

    return unlockedBadges;
  }
}

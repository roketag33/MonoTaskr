import { UserStats, Badge } from '../shared/types';

import { I18nService } from '../shared/i18n.service';

export const getBadges = (): Badge[] => [
  {
    id: 'FIRST_STEP',
    name: I18nService.getMessage('badgeFirstStepName'),
    description: I18nService.getMessage('badgeFirstStepDesc'),
    icon: '🌱',
    condition: (stats: UserStats) => stats.xp >= 1
  },
  {
    id: 'FOCUS_NOVICE',
    name: I18nService.getMessage('badgeFocusNoviceName'),
    description: I18nService.getMessage('badgeFocusNoviceDesc'),
    icon: '🧘',
    condition: (stats: UserStats) => stats.level >= 2
  },
  {
    id: 'FOCUS_MASTER',
    name: I18nService.getMessage('badgeFocusMasterName'),
    description: I18nService.getMessage('badgeFocusMasterDesc'),
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
    const badges = getBadges();

    badges.forEach((badge) => {
      if (!stats.badges.includes(badge.id)) {
        if (badge.condition && badge.condition(stats)) {
          unlockedBadges.push(badge);
        }
      }
    });

    return unlockedBadges;
  }
}

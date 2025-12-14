import { describe, it, expect } from 'vitest';
import { GamificationService } from './gamification.service';
import { UserStats } from '../shared/types';

describe('GamificationService', () => {
  describe('calculateLevel', () => {
    it('should start at level 1 with 0 XP', () => {
      expect(GamificationService.calculateLevel(0)).toBe(1);
    });

    it('should reach level 2 with 60 XP (1 hour)', () => {
      expect(GamificationService.calculateLevel(60)).toBe(2);
    });

    it('should reach level 3 with 120 XP (2 hours)', () => {
      // Linear progression for now: Level = floor(XP / 60) + 1
      expect(GamificationService.calculateLevel(120)).toBe(3);
    });
  });

  describe('checkBadges', () => {
    it('should unlock FIRST_STEP badge after 1 XP (1 minute)', () => {
      const stats: UserStats = {
        totalFocusSeconds: 60,
        xp: 1,
        level: 1,
        badges: []
      };

      const newBadges = GamificationService.checkBadges(stats);
      expect(newBadges).toHaveLength(1);
      expect(newBadges[0].id).toBe('FIRST_STEP');
    });

    it('should NOT unlock FIRST_STEP if already owned', () => {
      const stats: UserStats = {
        totalFocusSeconds: 60,
        xp: 1,
        level: 1,
        badges: ['FIRST_STEP']
      };

      const newBadges = GamificationService.checkBadges(stats);
      expect(newBadges).toHaveLength(0);
    });

    it('should unlock FOCUS_NOVICE when reaching Level 2', () => {
      const stats: UserStats = {
        totalFocusSeconds: 3600,
        xp: 60,
        level: 2,
        badges: ['FIRST_STEP']
      };

      const newBadges = GamificationService.checkBadges(stats);
      expect(newBadges).toHaveLength(1);
      expect(newBadges[0].id).toBe('FOCUS_NOVICE');
    });
  });
});

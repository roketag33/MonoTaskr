import { UserSettings, BlockingMode } from './types';

export const DEFAULT_BLOCKED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'facebook.com',
  'www.facebook.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'instagram.com',
  'www.instagram.com',
  'reddit.com',
  'www.reddit.com',
  'netflix.com',
  'www.netflix.com'
];

export const DEFAULT_WHITELISTED_DOMAINS: string[] = [];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  blockedSites: DEFAULT_BLOCKED_DOMAINS,
  whitelistedSites: DEFAULT_WHITELISTED_DOMAINS,
  blockingMode: BlockingMode.BLACKLIST,
  showTabTitleTimer: false,
  schedule: {
    enabled: false,
    days: [1, 2, 3, 4, 5], // Mon-Fri default
    startTime: '09:00',
    endTime: '17:00'
  },
  stats: {
    totalFocusSeconds: 0,
    xp: 0,
    level: 1,
    badges: []
  }
};

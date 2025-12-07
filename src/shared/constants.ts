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
    showTabTitleTimer: false
};

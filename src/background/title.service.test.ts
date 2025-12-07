import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TitleService } from './title.service';

// Mock chrome API
const chrome = {
    tabs: {
        query: vi.fn(),
        sendMessage: vi.fn(),
    },
    storage: {
        local: {
            get: vi.fn(),
        },
    },
};

global.chrome = chrome as any;

describe('TitleService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('formatTitle', () => {
        it('should format seconds into MM:SS format with app name', () => {
            expect(TitleService.formatTitle(65)).toBe('(01:05) MonoTaskr');
            expect(TitleService.formatTitle(25 * 60)).toBe('(25:00) MonoTaskr');
            expect(TitleService.formatTitle(9)).toBe('(00:09) MonoTaskr');
        });
    });

    describe('update', () => {
        it('should send message to update title if setting is enabled', async () => {
            // Mock storage to return enabled setting (or undefined as default true)
            chrome.storage.local.get.mockResolvedValue({ showTabTitleTimer: true });

            // Mock active tab
            chrome.tabs.query.mockResolvedValue([{ id: 123 }]);

            await TitleService.update(65);

            expect(chrome.storage.local.get).toHaveBeenCalledWith(['showTabTitleTimer']);
            expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
                action: 'UPDATE_TITLE',
                title: '(01:05) MonoTaskr'
            });
        });

        it('should NOT update title if setting is disabled', async () => {
            chrome.storage.local.get.mockResolvedValue({ showTabTitleTimer: false });

            await TitleService.update(65);

            expect(chrome.tabs.query).not.toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should reset title to default', async () => {
            // Setup: we need to update first to set lastTabId
            chrome.storage.local.get.mockResolvedValue({ showTabTitleTimer: true });
            chrome.tabs.query.mockResolvedValue([{ id: 123 }]);
            await TitleService.update(65);

            // Now reset
            await TitleService.reset();

            // verify reset message sent to lastTabId
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
                action: 'RESET_TITLE'
            });
        });
    });
});


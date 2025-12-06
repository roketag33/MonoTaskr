export class TitleService {
    static formatTitle(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `(${timeStr}) MonoTaskr`;
    }

    private static lastTabId: number | null = null;

    static async update(seconds: number): Promise<void> {
        // Check settings
        const settings = await chrome.storage.local.get(['showTabTitleTimer']);
        // Default to true if undefined
        const isEnabled = settings.showTabTitleTimer !== false;

        if (!isEnabled) {
            // Ensure we reset if we were previously updating
            if (this.lastTabId !== null) {
                await this.reset();
            }
            return;
        }

        const title = this.formatTitle(seconds);
        await this._sendTitleUpdate(title);
    }

    static async reset(): Promise<void> {
        if (this.lastTabId !== null) {
            try {
                await chrome.tabs.sendMessage(this.lastTabId, {
                    action: 'RESET_TITLE'
                });
            } catch (error) {
                // Ignore
            }
            this.lastTabId = null;
        }
    }

    private static async _sendTitleUpdate(title: string): Promise<void> {
        // We only update the active tab to avoid noise/perf issues on all tabs
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0 && tabs[0].id) {
            const currentTabId = tabs[0].id;

            // If we switched tabs, reset the previous one
            if (this.lastTabId !== null && this.lastTabId !== currentTabId) {
                try {
                    await chrome.tabs.sendMessage(this.lastTabId, {
                        action: 'RESET_TITLE'
                    });
                } catch (error) {
                    // Ignore error if tab closed
                }
            }

            this.lastTabId = currentTabId;

            try {
                await chrome.tabs.sendMessage(currentTabId, {
                    action: 'UPDATE_TITLE',
                    title: title
                });
            } catch (error) {
                // Ignore errors (e.g., content script not loaded on chrome:// URLs)
                // If failed, we might want to unset lastTabId so we don't try to reset it later
                // But safer to keep it to try resetting just in case
            }
        }
    }
}

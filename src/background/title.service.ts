export class TitleService {
    static formatTitle(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `(${timeStr}) MonoTaskr`;
    }

    static async update(seconds: number): Promise<void> {
        // Check settings
        const settings = await chrome.storage.local.get(['showTabTitleTimer']);
        // Default to true if undefined
        const isEnabled = settings.showTabTitleTimer !== false;

        if (!isEnabled) return;

        const title = this.formatTitle(seconds);
        await this._sendTitleUpdate(title);
    }

    static async reset(): Promise<void> {
        await this._sendTitleUpdate("MonoTaskr");
    }

    private static async _sendTitleUpdate(title: string): Promise<void> {
        // We only update the active tab to avoid noise/perf issues on all tabs
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0 && tabs[0].id) {
            try {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'UPDATE_TITLE',
                    title: title
                });
            } catch (error) {
                // Ignore errors (e.g., content script not loaded on chrome:// URLs)
            }
        }
    }
}

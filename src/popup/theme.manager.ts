import { Theme } from '../shared/types';
import { storage } from '../shared/storage';

export class ThemeManager {
  static async init() {
    // Initial load
    const savedTheme = await storage.getTheme();
    this.applyTheme(savedTheme);

    // Listen for storage changes (e.g. from settings)
    storage.onThemeChanged((newTheme) => {
      this.applyTheme(newTheme);
    });

    // Listen for system changes (only relevant if current theme is 'system')
    // We always listen, but only react if needed, or we just re-evaluate
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
      const currentTheme = await storage.getTheme();
      if (currentTheme === 'system') {
        this.applyTheme('system');
      }
    });
  }

  static applyTheme(theme: Theme) {
    const root = document.documentElement;
    let effectiveTheme = theme;

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }
}

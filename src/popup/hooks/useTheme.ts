import { useEffect } from 'react';
import { storage } from '../../shared/storage';
import { Theme } from '../../shared/types';

export const useTheme = () => {
  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      const root = document.documentElement;
      let effectiveTheme = theme;

      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = isDark ? 'dark' : 'light';
      }

      root.setAttribute('data-theme', effectiveTheme);
    };

    const init = async () => {
      const t = await storage.getTheme();
      applyTheme(t);
    };
    init();

    // Listen for storage changes
    const storageListener = (newTheme: Theme) => {
      applyTheme(newTheme);
    };
    // storage.onThemeChanged returns void, but registers listener.
    // We can't easily unsubscribe with current storage.ts helper implementation (it doesn't return the callback reference for removing)
    // But for popup it's fine.
    storage.onThemeChanged(storageListener);

    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemListener = async () => {
      const currentTheme = await storage.getTheme();
      if (currentTheme === 'system') {
        // Re-evaluate
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', systemListener);

    return () => {
      mediaQuery.removeEventListener('change', systemListener);
      // Storage listener cleanup missing due to storage helper limitations,
      // but harmless in popup context (destroyed on close)
    };
  }, []);
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeManager } from './theme.manager';
import { storage } from '../shared/storage';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((_query) => ({
    matches: false,
    media: _query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock storage
vi.mock('../shared/storage', () => ({
  storage: {
    getTheme: vi.fn(),
    setTheme: vi.fn(),
    onThemeChanged: vi.fn()
  }
}));

describe('ThemeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', '');
  });

  it('should apply "light" theme directly', async () => {
    (storage.getTheme as any).mockResolvedValue('light');
    await ThemeManager.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should apply "dark" theme directly', async () => {
    (storage.getTheme as any).mockResolvedValue('dark');
    setTimeout(() => {}, 0); // Wait logic
    await ThemeManager.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should resolve "system" theme to "dark" if prefers-color-scheme is dark', async () => {
    (storage.getTheme as any).mockResolvedValue('system');
    window.matchMedia = vi.fn().mockImplementation((_query) => ({
      matches: _query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn()
    }));

    await ThemeManager.init();
    // Should set to dark or nothing (if default style is light, but css handles data-theme="dark")
    // Our implementation should set data-theme="dark" explicitly if system is dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should resolve "system" theme to "light" if prefers-color-scheme is light', async () => {
    (storage.getTheme as any).mockResolvedValue('system');
    window.matchMedia = vi.fn().mockImplementation((_query) => ({
      matches: false, // Not dark
      addEventListener: vi.fn()
    }));

    await ThemeManager.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

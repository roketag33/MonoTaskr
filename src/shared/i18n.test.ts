import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  const originalChrome = (global as any).chrome;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <h1 data-i18n="appName">Default Title</h1>
      <p data-i18n="appDescription">Default Description</p>
      <input type="text" data-i18n="searchPlaceholder" placeholder="Search..." />
      <div data-i18n="unknownKey">Default Unknown</div>
      <div>No i18n</div>
    `;

    // Mock chrome.i18n
    (global as any).chrome = {
      i18n: {
        getMessage: vi.fn((key: string) => {
          const messages: Record<string, string> = {
            appName: 'MonoTaskr Test',
            appDescription: 'Test Description',
            searchPlaceholder: 'Search Test'
          };
          return messages[key] || '';
        })
      }
    };
  });

  afterEach(() => {
    (global as any).chrome = originalChrome;
    document.body.innerHTML = '';
  });

  it('should get message via chrome.i18n', () => {
    expect(I18nService.getMessage('appName')).toBe('MonoTaskr Test');
  });

  it('should return key if message not found and chrome.i18n returns empty', () => {
    expect(I18nService.getMessage('unknownKey')).toBe('unknownKey');
  });

  it('should translate elements with data-i18n attribute', () => {
    I18nService.init();

    const h1 = document.querySelector('h1');
    const p = document.querySelector('p');
    const input = document.querySelector('input');
    const divUnknown = document.querySelector('div[data-i18n="unknownKey"]');

    expect(h1?.textContent).toBe('MonoTaskr Test');
    expect(p?.textContent).toBe('Test Description');
    expect(input?.placeholder).toBe('Search Test');

    // Unknown key should fallback to key or stay empty depending on getMessage logic.
    // In our service: return chrome.i18n.getMessage(...) || key;
    // Mock returns '' for unknown, so it returns key.
    expect(divUnknown?.textContent).toBe('unknownKey');
  });

  it('should fallback to key if chrome is undefined', () => {
    const originalChrome = (global as any).chrome;
    delete (global as any).chrome;

    expect(I18nService.getMessage('testKey')).toBe('testKey');

    // Restore chrome for other tests
    (global as any).chrome = originalChrome;
  });
});

export class I18nService {
  /**
   * Initialize i18n by replacing text content of elements with [data-i18n] attribute
   */
  static init(): void {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const message = this.getMessage(key);
        if (message) {
          // If element is an input with placeholder, translate placeholder
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            (element as HTMLInputElement).placeholder = message;
          } else {
            element.textContent = message;
          }
        }
      }
    });
  }

  /**
   * Get localized message from chrome.i18n API
   * @param key The message key
   * @param substitutions Optional substitution strings
   * @returns The localized string or the key if not found
   */
  static getMessage(key: string, substitutions?: string | string[]): string {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      return chrome.i18n.getMessage(key, substitutions) || key;
    }
    // Fallback for non-extension environment (e.g. tests without mock)
    return key;
  }
}

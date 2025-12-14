import React, { useEffect, useState } from 'react';
import { I18nService } from '../../shared/i18n.service';
import { storage } from '../../shared/storage';
import { BlockingMode, Theme } from '../../shared/types';
import { ExportService } from '../../shared/export.service';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [blockingMode, setBlockingMode] = useState<BlockingMode>(BlockingMode.BLACKLIST);
  const [theme, setTheme] = useState<Theme>('system');
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [whitelistedSites, setWhitelistedSites] = useState<string[]>([]);
  const [showTabTitle, setShowTabTitle] = useState(true);
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setBlockingMode(await storage.getBlockingMode());
      setTheme(await storage.getTheme());
      setBlockedSites(await storage.getBlockedSites());
      setWhitelistedSites(await storage.getWhitelistedSites());
      setShowTabTitle(await storage.getShowTabTitleTimer());
    };
    loadSettings();
  }, []);

  const handleModeChange = async (mode: BlockingMode) => {
    setBlockingMode(mode);
    await storage.setBlockingMode(mode);
  };

  const handleThemeChange = async (t: Theme) => {
    setTheme(t);
    await storage.setTheme(t);
  };

  const handleAddSite = async () => {
    if (!newSite) return;
    const list =
      blockingMode === BlockingMode.BLACKLIST ? [...blockedSites] : [...whitelistedSites];
    if (!list.includes(newSite)) {
      list.push(newSite);
      if (blockingMode === BlockingMode.BLACKLIST) {
        setBlockedSites(list);
        await storage.setBlockedSites(list);
      } else {
        setWhitelistedSites(list);
        await storage.setWhitelistedSites(list);
      }
    }
    setNewSite('');
  };

  const handleRemoveSite = async (site: string) => {
    if (blockingMode === BlockingMode.BLACKLIST) {
      const newList = blockedSites.filter((s) => s !== site);
      setBlockedSites(newList);
      await storage.setBlockedSites(newList);
    } else {
      const newList = whitelistedSites.filter((s) => s !== site);
      setWhitelistedSites(newList);
      await storage.setWhitelistedSites(newList);
    }
  };

  const handleExport = async () => {
    try {
      const sessions = await storage.getSessions();
      const stats = await storage.getUserStats();
      const settings = {
        blockedSites: await storage.getBlockedSites(),
        whitelistedSites: await storage.getWhitelistedSites(),
        blockingMode: await storage.getBlockingMode(),
        schedule: await storage.getScheduleConfig(),
        theme: await storage.getTheme(),
        tempAccessLimit: await storage.getTempAccessLimit(),
        showTabTitleTimer: await storage.getShowTabTitleTimer()
      };

      const exportData = {
        exportDate: new Date().toISOString(),
        sessions,
        stats,
        settings
      };

      const json = ExportService.generateJSON(exportData);
      const filename = `monotaskr-export-${new Date().toISOString().slice(0, 10)}.json`;
      ExportService.downloadFile(json, filename, 'application/json');
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  };

  const currentSites = blockingMode === BlockingMode.BLACKLIST ? blockedSites : whitelistedSites;

  return (
    <div id="settings-view">
      <h2>{I18nService.getMessage('settingsTitle')}</h2>

      <div className="settings-section">
        <h3>{I18nService.getMessage('settingsGeneralTitle')}</h3>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={showTabTitle}
              onChange={async (e) => {
                setShowTabTitle(e.target.checked);
                await storage.setShowTabTitleTimer(e.target.checked);
              }}
            />
            <span>{I18nService.getMessage('settingTabTitle')}</span>
          </label>
        </div>

        <div className="setting-item">
          <label>{I18nService.getMessage('settingModeLabel')}</label>
          <select
            value={blockingMode}
            onChange={(e) => handleModeChange(e.target.value as BlockingMode)}
          >
            <option value={BlockingMode.BLACKLIST}>
              {I18nService.getMessage('modeBlacklist')}
            </option>
            <option value={BlockingMode.WHITELIST}>
              {I18nService.getMessage('modeWhitelist')}
            </option>
          </select>
        </div>

        <div className="setting-item">
          <label>{I18nService.getMessage('settingTheme')}</label>
          <select value={theme} onChange={(e) => handleThemeChange(e.target.value as Theme)}>
            <option value="system">{I18nService.getMessage('themeSystem')}</option>
            <option value="light">{I18nService.getMessage('themeLight')}</option>
            <option value="dark">{I18nService.getMessage('themeDark')}</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>{I18nService.getMessage('settingsDataTitle')}</h3>
        <div className="setting-item">
          <button className="secondary-btn" onClick={handleExport}>
            {I18nService.getMessage('btnExport')}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>
          {blockingMode === BlockingMode.BLACKLIST
            ? I18nService.getMessage('titleBlockedSites')
            : I18nService.getMessage('titleWhitelistedSites')}
        </h3>
        <div className="add-site-form">
          <input
            type="text"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            placeholder={I18nService.getMessage('placeholderAddSite')}
          />
          <button className="primary-btn" onClick={handleAddSite}>
            {I18nService.getMessage('btnAdd')}
          </button>
        </div>
        <ul id="sites-list">
          {currentSites.map((site) => (
            <li key={site} className="site-item">
              <span>{site}</span>
              <button onClick={() => handleRemoveSite(site)}>🗑️</button>
            </li>
          ))}
        </ul>
        <button className="secondary-btn" onClick={onBack}>
          {I18nService.getMessage('btnBack')}
        </button>
      </div>
    </div>
  );
};

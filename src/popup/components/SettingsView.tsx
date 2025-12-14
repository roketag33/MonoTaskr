import React, { useEffect, useState } from 'react';
import { I18nService } from '../../shared/i18n.service';
import { storage } from '../../shared/storage';
import { BlockingMode, Theme } from '../../shared/types';
import { ExportService } from '../../shared/export.service';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Trash2, Download, Plus } from 'lucide-react';

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
    <div className="space-y-6 pb-4">
      <h2 className="text-2xl font-bold">{I18nService.getMessage('settingsTitle')}</h2>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{I18nService.getMessage('settingsGeneralTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tab-title" className="flex flex-col gap-1">
              <span>{I18nService.getMessage('settingTabTitle')}</span>
              <span className="font-normal text-xs text-muted-foreground">
                {I18nService.getMessage('settingTabTitleDescription')}
              </span>
            </Label>
            <Switch
              id="tab-title"
              checked={showTabTitle}
              onCheckedChange={async (checked) => {
                setShowTabTitle(checked);
                await storage.setShowTabTitleTimer(checked);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>{I18nService.getMessage('settingModeLabel')}</Label>
            <div className="flex flex-col gap-2">
              <Button
                variant={blockingMode === BlockingMode.BLACKLIST ? 'default' : 'outline'}
                onClick={() => handleModeChange(BlockingMode.BLACKLIST)}
                size="sm"
                className="w-full justify-start pl-4"
              >
                {I18nService.getMessage('modeBlacklist')}
              </Button>
              <Button
                variant={blockingMode === BlockingMode.WHITELIST ? 'default' : 'outline'}
                onClick={() => handleModeChange(BlockingMode.WHITELIST)}
                size="sm"
                className="w-full justify-start pl-4"
              >
                {I18nService.getMessage('modeWhitelist')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{I18nService.getMessage('settingTheme')}</Label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as Theme)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="system">{I18nService.getMessage('themeSystem')}</option>
              <option value="light">{I18nService.getMessage('themeLight')}</option>
              <option value="dark">{I18nService.getMessage('themeDark')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Site Management */}
      <Card>
        <CardHeader>
          <CardTitle>
            {blockingMode === BlockingMode.BLACKLIST
              ? I18nService.getMessage('titleBlockedSites')
              : I18nService.getMessage('titleWhitelistedSites')}
          </CardTitle>
          <CardDescription>
            {blockingMode === BlockingMode.BLACKLIST
              ? 'These sites will be blocked during focus.'
              : 'Only these sites will be accessible.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder={I18nService.getMessage('placeholderAddSite')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
            />
            <Button onClick={handleAddSite} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-48 overflow-y-auto rounded-md border p-2 space-y-2">
            {currentSites.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No sites added yet.</p>
            )}
            {currentSites.map((site) => (
              <div
                key={site}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted group"
              >
                <span className="text-sm font-medium truncat max-w-[200px]">{site}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSite(site)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>{I18nService.getMessage('settingsDataTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {I18nService.getMessage('btnExport')}
          </Button>
        </CardContent>
      </Card>

      <Button variant="ghost" className="w-full" onClick={onBack}>
        {I18nService.getMessage('btnBack')}
      </Button>
    </div>
  );
};

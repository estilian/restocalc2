export type ThemeMode = 'auto' | 'light' | 'dark';

export const googleAdMobBannerId = 'ca-app-pub-4675518894512456/4808600748';
export const googleAdMobTestBannerId = 'ca-app-pub-3940256099942544/6300978111'
export const showGoogleAd: boolean = true; // Set to false to disable ads
export const ADMOB_TEST_MODE: boolean = true; // Set to false for production

export interface Settings {
  theme: ThemeMode;
  saveHistory: boolean;
  saveLocation: boolean;
}

const SETTINGS_KEY = 'restocalc_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  saveHistory: true,
  saveLocation: false,
};

export const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const getEffectiveTheme = (theme: ThemeMode): 'light' | 'dark' => {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

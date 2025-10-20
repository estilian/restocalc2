export interface HistoryItem {
  id: string;
  date: string;
  time: string;
  dueEUR: number;
  dueBGN: number;
  paidEUR: number;
  paidBGN: number;
  changeEUR: number;
  location?: { lat: number; lng: number };
}

const HISTORY_KEY = 'restocalc_history';

export const loadHistory = (): HistoryItem[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
  return [];
};

export const saveHistory = (history: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'date' | 'time'>): HistoryItem => {
  const now = new Date();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    date: now.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'),
    time: now.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
  };
  
  const currentHistory = loadHistory();
  const updatedHistory = [newItem, ...currentHistory];
  saveHistory(updatedHistory);
  
  return newItem;
};

export const deleteHistoryItem = (id: string): void => {
  const currentHistory = loadHistory();
  const updatedHistory = currentHistory.filter(item => item.id !== id);
  saveHistory(updatedHistory);
};

export const clearHistory = (): void => {
  saveHistory([]);
};

export const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Failed to get location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  });
};

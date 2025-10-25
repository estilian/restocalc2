import { Geolocation } from '@capacitor/geolocation';

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

// ✅ по-надежден генератор на ID (randomUUID, а при липса: timestamp+random)
const generateId = (): string => {
  const g: any = globalThis as any;
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// за сравнение на суми с 2 знака
const n2 = (n: number) => Number((n ?? 0).toFixed(2));
const isSameByAmounts = (a: HistoryItem, b: HistoryItem) =>
  n2(a.dueEUR)    === n2(b.dueEUR)    &&
  n2(a.dueBGN)    === n2(b.dueBGN)    &&
  n2(a.paidEUR)   === n2(b.paidEUR)   &&
  n2(a.paidBGN)   === n2(b.paidBGN)   &&
  n2(a.changeEUR) === n2(b.changeEUR);

export const loadHistory = (): HistoryItem[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const arr: HistoryItem[] = saved ? JSON.parse(saved) : [];

    // ✅ самовъзстановяване: ако има дублирани id, сменяме ги тук
    const seen = new Set<string>();
    let mutated = false;
    const repaired = arr.map((it, idx) => {
      if (!it.id || seen.has(it.id)) {
        mutated = true;
        const newId = `${generateId()}-${idx}`;
        seen.add(newId);
        return { ...it, id: newId };
      }
      seen.add(it.id);
      return it;
    });

    if (mutated) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(repaired));
    }

    return repaired;
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const saveHistory = (history: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const addHistoryItem = (
  item: Omit<HistoryItem, 'id' | 'date' | 'time'>
): HistoryItem => {
  const now = new Date();
  const newItem: HistoryItem = {
    ...item,
    id: generateId(), // ✅ вече уникално
    date: now
      .toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.'),
    time: now.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
  };

  const currentHistory = loadHistory();
  const last = currentHistory[0];

  // ✅ защита от дубликати по суми (както искаше)
  if (last && isSameByAmounts(last, newItem)) {
    return last;
  }

  const updatedHistory = [newItem, ...currentHistory];
  saveHistory(updatedHistory);
  return newItem;
};

export const deleteHistoryItem = (id: string): void => {
  const currentHistory = loadHistory();
  const updatedHistory = currentHistory.filter((item) => item.id !== id);
  saveHistory(updatedHistory);
};

export const clearHistory = (): void => {
  saveHistory([]);
};

export const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
      const permissionStatus = await Geolocation.requestPermissions();
      if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
        console.error('Location permission not granted.');
        return null;
      }
    }

    const position = await Geolocation.getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
};

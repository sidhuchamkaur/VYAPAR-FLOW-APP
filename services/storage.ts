import { AppState, ShopSettings } from '../types';

const STORAGE_KEY = 'vyapar_flow_db_v1';

const defaultSettings: ShopSettings = {
  shopName: 'My Workshop',
  ownerName: 'Shop Owner',
  contactNumber: '',
  address: '',
  dataFolderPath: ''
};

const defaultState: AppState = {
  customers: [],
  finances: [],
  orders: [],
  settings: defaultSettings,
};

// Define the interface for the Electron Bridge
// This tells TypeScript that these functions might exist on the window object
declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      saveData: (path: string, data: string) => Promise<boolean>;
    };
  }
}

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return defaultState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state", err);
    return defaultState;
  }
};

export const saveState = async (state: AppState) => {
  try {
    // 1. Always save to LocalStorage (as a cache/backup)
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);

    // 2. If running in Electron AND a folder is selected, save to disk
    if (window.electronAPI && state.settings.dataFolderPath) {
      // We format with null, 2 to make it "readable" (pretty print)
      const readableData = JSON.stringify(state, null, 2);
      await window.electronAPI.saveData(state.settings.dataFolderPath, readableData);
    }
  } catch (err) {
    console.error("Could not save state", err);
  }
};

export const exportData = (state: AppState) => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
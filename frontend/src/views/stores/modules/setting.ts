import { create } from 'zustand';

interface Setting {
  CHROME_PATH: string;
  DATA_PATH: string;
  DATA_PATH_CHROME_DATA: string;
  DATA_PATH_DB: string;
  DATA_PATH_JSON: string;
  DATA_PATH_SNAPSHOT: string;
  version: string;
}

export interface SettingStore extends Setting {
  getSettingInfo: Function;
  setSettingInfo: Function;
  setVersion: Function;
}

export const useSettingStore = create<SettingStore>((set, get: Function) => ({
  CHROME_PATH: '',
  DATA_PATH: '',
  DATA_PATH_CHROME_DATA: '',
  DATA_PATH_DB: '',
  DATA_PATH_JSON: '',
  DATA_PATH_SNAPSHOT: '',
  version: '',
  getSettingInfo: () => {
    return get();
  },
  setSettingInfo: (setting: Setting) => {
    set((_state) => {
      return {
        ...setting,
        version: _state.version,
      };
    });
  },
  setVersion: (version: string) => {
    set((_state) => {
      return {
        version: version,
      };
    });
  },
}));

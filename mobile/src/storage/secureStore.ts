import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const webStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }
};

export const secureStore = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        webStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`SecureStore error setting item for key ${key}:`, error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return webStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`SecureStore error getting item for key ${key}:`, error);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        webStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`SecureStore error deleting item for key ${key}:`, error);
    }
  },
};

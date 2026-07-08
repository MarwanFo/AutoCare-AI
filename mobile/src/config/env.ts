import { Platform } from 'react-native';

export const ENV = {
  API_URL: Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080',
  }),
  TIMEOUT: 15000,
};

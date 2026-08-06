import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '10.0.2.2';
};

const hostIp = getDevHostIp();

export const ENV = {
  API_URL: Platform.select({
    android: __DEV__ ? `http://${hostIp}:8080` : 'http://10.0.2.2:8080',
    ios: __DEV__ ? `http://${hostIp}:8080` : 'http://localhost:8080',
    default: 'http://localhost:8080',
  }),
  TIMEOUT: 15000,
};

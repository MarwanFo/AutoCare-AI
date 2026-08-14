import { apiClient } from '@/api/client';
import { secureStore } from '@/storage/secureStore';

export interface GoogleAuthSuccessResult {
  type: 'SUCCESS';
  accessToken: string;
  refreshToken: string;
  user: any;
}

export interface GoogleAuthVerificationRequiredResult {
  type: 'VERIFICATION_REQUIRED';
  email: string;
  message: string;
}

export interface GoogleAuthCancelledResult {
  type: 'CANCELLED';
}

export type GoogleAuthResult =
  | GoogleAuthSuccessResult
  | GoogleAuthVerificationRequiredResult
  | GoogleAuthCancelledResult;

export async function performGoogleSignIn(): Promise<GoogleAuthResult> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error('Google Sign-In is not configured. (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing)');
  }

  let nitroModule: any;
  try {
    nitroModule = await import('react-native-nitro-google-signin');
  } catch (err) {
    throw new Error('Google Sign-In requires an Expo Development Build with native NitroModules enabled.');
  }

  const {
    GoogleOneTapSignIn,
    isSuccessResponse,
    isCancelledResponse,
    isNoSavedCredentialFoundResponse,
  } = nitroModule;

  if (!GoogleOneTapSignIn) {
    throw new Error('Google Sign-In is not supported on this platform/build.');
  }

  GoogleOneTapSignIn.configure({
    webClientId,
  });

  try {
    await GoogleOneTapSignIn.checkPlayServices();
  } catch (e) {
    // Play services check optional or fallback
  }

  let response: any = await GoogleOneTapSignIn.signIn();

  if (isNoSavedCredentialFoundResponse && isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount();
  }

  if (isNoSavedCredentialFoundResponse && isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.presentExplicitSignIn();
  }

  if (isCancelledResponse && isCancelledResponse(response)) {
    return { type: 'CANCELLED' };
  }

  if (isSuccessResponse && isSuccessResponse(response) && response.data?.idToken) {
    const idToken = response.data.idToken;

    const res = await apiClient.post('/api/v1/auth/mobile/google', { idToken });

    if (res.status === 202 || res.data?.status === 'VERIFICATION_REQUIRED') {
      return {
        type: 'VERIFICATION_REQUIRED',
        email: res.data.email,
        message: res.data.message || 'Google account created. Please check your email to complete verification.',
      };
    }

    const { accessToken, refreshToken, user } = res.data;
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid response from server.');
    }

    await secureStore.setItem('access_token', accessToken);
    await secureStore.setItem('refresh_token', refreshToken);

    return {
      type: 'SUCCESS',
      accessToken,
      refreshToken,
      user,
    };
  }

  throw new Error('Google Sign-In failed or returned no ID token.');
}

export async function performGoogleSignOut(): Promise<void> {
  try {
    const nitroModule = await import('react-native-nitro-google-signin');
    if (nitroModule?.GoogleOneTapSignIn) {
      await nitroModule.GoogleOneTapSignIn.signOut();
    }
  } catch (error) {
    // Ignore sign out errors if native module is absent or user was not logged into Google locally
  }
}

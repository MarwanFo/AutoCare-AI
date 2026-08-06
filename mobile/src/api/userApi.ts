import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ChangePasswordRequest,
  DeactivateAccountRequest,
  AvatarUploadResponse,
} from '@/types/user';

export const userApi = {
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(ENDPOINTS.USER.ME);
    return response.data;
  },

  updateProfile: async (request: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(ENDPOINTS.USER.ME, request);
    return response.data;
  },

  updatePreferences: async (request: UpdatePreferencesRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(ENDPOINTS.USER.PREFERENCES, request);
    return response.data;
  },

  uploadAvatar: async (fileUri: string): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<AvatarUploadResponse>(ENDPOINTS.USER.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete(ENDPOINTS.USER.AVATAR);
  },

  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    await apiClient.put(ENDPOINTS.USER.PASSWORD, request);
  },

  deactivateAccount: async (request: DeactivateAccountRequest): Promise<void> => {
    // Axios DELETE accepts a configuration object where request body is passed under the 'data' key
    await apiClient.delete(ENDPOINTS.USER.ME, { data: request });
  },
};

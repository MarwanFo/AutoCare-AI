export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  preferredLanguage: 'EN' | 'FR' | 'AR';
  preferredCurrency: 'USD' | 'EUR' | 'MAD' | 'GBP';
  preferredDistanceUnit: 'KM' | 'MILES';
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  isProfileCompleted: boolean;
  roles: string[];
  permissions: string[];
  status: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
}

export interface UpdatePreferencesRequest {
  preferredLanguage: 'EN' | 'FR' | 'AR';
  preferredCurrency: 'USD' | 'EUR' | 'MAD' | 'GBP';
  preferredDistanceUnit: 'KM' | 'MILES';
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface DeactivateAccountRequest {
  confirmationPassword: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

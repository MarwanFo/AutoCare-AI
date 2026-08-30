import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useUserProfile } from '@/hooks/user/useUserProfile';
import { useUpdateProfile } from '@/hooks/user/useUpdateProfile';
import { useUpdatePreferences } from '@/hooks/user/useUpdatePreferences';
import { useUploadAvatar } from '@/hooks/user/useUploadAvatar';
import { useDeleteAvatar } from '@/hooks/user/useDeleteAvatar';
import { useChangePassword } from '@/hooks/user/useChangePassword';
import { useDeactivateAccount } from '@/hooks/user/useDeactivateAccount';
import { useVehicles } from '@/hooks/vehicle/useVehicles';

import { ProfileHeaderCard } from '@/features/profile/components/ProfileHeaderCard';
import { ActiveSessionsCard } from '@/features/profile/components/ActiveSessionsCard';

import { ErrorBanner } from '@/features/auth/components/ErrorBanner';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useAuthStore } from '@/stores/authStore';
import { secureStore } from '@/storage/secureStore';
import { apiClient } from '@/api/client';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

const PRESET_AVATARS = [
  { name: 'Classic Racer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { name: 'Urban Driver', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Night Rider', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { name: 'Tech Driver', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
];

export default function ProfileDashboardScreen() {
  const { t } = useAppTranslation(['profile', 'common', 'errors', 'validation']);
  const { data: profile, isLoading, isError, refetch } = useUserProfile();
  const { data: vehiclesData } = useVehicles({ page: 0, size: 1 });
  const vehiclesCount = vehiclesData?.totalElements || 0;

  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const changePassword = useChangePassword();
  const deactivateAccount = useDeactivateAccount();
  const queryClient = useQueryClient();

  const { currentLanguage, supportedLanguages, setLanguage, isRTL } = useLanguage();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'security' | 'storage'>('personal');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Preference states
  const [lang, setLang] = useState<'EN' | 'FR' | 'AR'>('FR');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'MAD' | 'GBP'>('EUR');
  const [unit, setUnit] = useState<'KM' | 'MILES'>('KM');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modal states
  const [isDeactivateModalVisible, setIsDeactivateModalVisible] = useState(false);
  const [confirmDeactivatePassword, setConfirmDeactivatePassword] = useState('');
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Success / Error banners
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [prefSuccessMsg, setPrefSuccessMsg] = useState<string | null>(null);
  const [prefErrorMsg, setPrefErrorMsg] = useState<string | null>(null);

  const [pwdSuccessMsg, setPwdSuccessMsg] = useState<string | null>(null);
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string | null>(null);

  const [storageMsg, setStorageMsg] = useState<string | null>(null);
  const [deactivateErrorMsg, setDeactivateErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setLang(profile.preferredLanguage || 'FR');
      setCurrency(profile.preferredCurrency || 'EUR');
      setUnit(profile.preferredDistanceUnit || 'KM');
      setPushEnabled(profile.pushNotificationsEnabled ?? true);
      setEmailEnabled(profile.emailNotificationsEnabled ?? true);
    }
  }, [profile]);

  const handleUpdateProfile = () => {
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (!fullName.trim()) {
      setProfileErrorMsg(t('profile:profile_update_failed'));
      return;
    }

    updateProfile.mutate(
      { fullName, phoneNumber: phoneNumber.trim() || undefined },
      {
        onSuccess: () => {
          setProfileSuccessMsg(t('profile:profile_saved_success'));
        },
        onError: (err: any) => {
          setProfileErrorMsg(err?.response?.data?.message || t('profile:profile_update_failed'));
        },
      }
    );
  };

  const handleUpdatePreferences = () => {
    setPrefSuccessMsg(null);
    setPrefErrorMsg(null);

    updatePreferences.mutate(
      {
        preferredLanguage: lang,
        preferredCurrency: currency,
        preferredDistanceUnit: unit,
        pushNotificationsEnabled: pushEnabled,
        emailNotificationsEnabled: emailEnabled,
      },
      {
        onSuccess: () => {
          setPrefSuccessMsg(t('profile:preferences_updated_success'));
          const lowerLang = lang.toLowerCase() as 'en' | 'fr' | 'ar';
          if (lowerLang !== currentLanguage) {
            setLanguage(lowerLang);
          }
        },
        onError: (err: any) => {
          setPrefErrorMsg(err?.response?.data?.message || t('profile:preferences_update_failed'));
        },
      }
    );
  };

  const handleChangePassword = () => {
    setPwdSuccessMsg(null);
    setPwdErrorMsg(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdErrorMsg('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('New password and confirmation do not match.');
      return;
    }

    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setPwdSuccessMsg(t('profile:password_updated_success'));
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err: any) => {
          setPwdErrorMsg(err?.response?.data?.message || t('profile:password_change_failed'));
        },
      }
    );
  };

  const handleClearCache = () => {
    setStorageMsg(null);
    queryClient.clear();
    setStorageMsg(t('profile:cache_cleared_msg', { defaultValue: 'Local app cache and temporary image storage successfully cleared.' }));
  };

  const handleDeactivate = () => {
    setDeactivateErrorMsg(null);

    if (!confirmDeactivatePassword) {
      setDeactivateErrorMsg('Password is required to deactivate account.');
      return;
    }

    deactivateAccount.mutate(
      { confirmationPassword: confirmDeactivatePassword },
      {
        onSuccess: async () => {
          setIsDeactivateModalVisible(false);
          Alert.alert(
            t('profile:account_deactivated_alert'),
            '',
            [{ text: 'OK', onPress: () => useAuthStore.getState().clearSession() }]
          );
        },
        onError: (err: any) => {
          setDeactivateErrorMsg(err?.response?.data?.message || 'Incorrect password.');
        },
      }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile:logout_confirm_title', { defaultValue: 'Log Out' }),
      t('profile:logout_confirm_msg', { defaultValue: 'Are you sure you want to log out of your account?' }),
      [
        { text: t('common:cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('profile:logout_button', { defaultValue: 'Log Out of AutoCare' }),
          style: 'destructive',
          onPress: async () => {
            try {
              const refreshToken = await secureStore.getItem('refreshToken');
              if (refreshToken) {
                await apiClient.post('/api/v1/auth/mobile-logout', { refreshToken });
              }
            } catch (err) {
              console.warn('Logout endpoint call failed, clearing client session:', err);
            } finally {
              useAuthStore.getState().clearSession();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#abc7ff" />
        <Text style={styles.loadingText}>{t('profile:syncing_profile')}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <ErrorBanner message={t('profile:sync_failed')} />
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>{t('profile:retry_sync')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Screen Top Header */}
      <View style={[styles.topNav, isRTL && styles.rowReverse]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.screenTitle, isRTL && styles.textRight]}>
            {t('profile:header_title')}
          </Text>
          <Text style={[styles.screenSubtitle, isRTL && styles.textRight]}>
            {t('profile:header_subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#abc7ff" />}
      >
        {/* Profile Hero Header Card */}
        <ProfileHeaderCard
          fullName={profile?.fullName || ''}
          email={profile?.email}
          phoneNumber={profile?.phoneNumber}
          avatarUrl={profile?.avatarUrl}
          onEditAvatarPress={() => setIsAvatarModalVisible(true)}
          vehiclesCount={vehiclesCount}
        />

        {/* Navigation Tabs Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.tabContainer}>
            {[
              { id: 'personal', label: t('profile:tab_personal', { defaultValue: 'Personal' }) },
              { id: 'preferences', label: t('profile:tab_preferences', { defaultValue: 'Preferences' }) },
              { id: 'security', label: t('profile:tab_security', { defaultValue: 'Security & Sessions' }) },
              { id: 'storage', label: t('profile:tab_storage', { defaultValue: 'Storage & App' }) },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <View style={styles.tabContentCard}>
            <Text style={[styles.sectionHeading, isRTL && styles.textRight]}>
              {t('profile:personal_details')}
            </Text>

            {profileSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{profileSuccessMsg}</Text></View>}
            {profileErrorMsg && <ErrorBanner message={profileErrorMsg} />}

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, isRTL && styles.textRight]}>Full Name</Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.textRight]}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('profile:full_name_placeholder')}
                placeholderTextColor="#8e9192"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:phone_number_label')}</Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.textRight]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="+1 234 567 8900"
                placeholderTextColor="#8e9192"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleUpdateProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color="#131313" />
              ) : (
                <Text style={styles.primaryActionText}>{t('profile:save_details')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: PREFERENCES */}
        {activeTab === 'preferences' && (
          <View style={styles.tabContentCard}>
            <Text style={[styles.sectionHeading, isRTL && styles.textRight]}>
              {t('profile:app_preferences')}
            </Text>

            {prefSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{prefSuccessMsg}</Text></View>}
            {prefErrorMsg && <ErrorBanner message={prefErrorMsg} />}

            {/* Language Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:language')}</Text>
              <View style={styles.pillRow}>
                {[
                  { code: 'EN', label: 'English', target: 'en' },
                  { code: 'FR', label: 'Français', target: 'fr' },
                  { code: 'AR', label: 'العربية', target: 'ar' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.pillOption, (currentLanguage.toUpperCase() === item.code || lang === item.code) && styles.pillOptionActive]}
                    onPress={() => {
                      setLang(item.code as any);
                      setLanguage(item.target as any);
                    }}
                  >
                    <Text style={[styles.pillText, (currentLanguage.toUpperCase() === item.code || lang === item.code) && styles.pillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Currency Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:currency')}</Text>
              <View style={styles.pillRow}>
                {['EUR', 'USD', 'MAD', 'GBP'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[styles.pillOption, currency === curr && styles.pillOptionActive]}
                    onPress={() => setCurrency(curr as any)}
                  >
                    <Text style={[styles.pillText, currency === curr && styles.pillTextActive]}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Unit Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:distance_unit')}</Text>
              <View style={styles.pillRow}>
                {[
                  { code: 'KM', label: t('profile:kilometers') },
                  { code: 'MILES', label: t('profile:miles') },
                ].map((u) => (
                  <TouchableOpacity
                    key={u.code}
                    style={[styles.pillOption, unit === u.code && styles.pillOptionActive]}
                    onPress={() => setUnit(u.code as any)}
                  >
                    <Text style={[styles.pillText, unit === u.code && styles.pillTextActive]}>
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notification Toggles */}
            <View style={[styles.switchRow, isRTL && styles.rowReverse]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.switchTitle}>{t('profile:push_notifications_title')}</Text>
                <Text style={styles.switchSubtitle}>{t('profile:push_notifications_subtitle')}</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                thumbColor={pushEnabled ? '#abc7ff' : '#444748'}
                trackColor={{ false: '#2a2a2a', true: '#abc7ff50' }}
              />
            </View>

            <View style={[styles.switchRow, isRTL && styles.rowReverse]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.switchTitle}>{t('profile:email_notifications_title')}</Text>
                <Text style={styles.switchSubtitle}>{t('profile:email_notifications_subtitle')}</Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                thumbColor={emailEnabled ? '#abc7ff' : '#444748'}
                trackColor={{ false: '#2a2a2a', true: '#abc7ff50' }}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleUpdatePreferences}
              disabled={updatePreferences.isPending}
            >
              {updatePreferences.isPending ? (
                <ActivityIndicator size="small" color="#131313" />
              ) : (
                <Text style={styles.primaryActionText}>{t('profile:update_preferences')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: SECURITY & SESSIONS */}
        {activeTab === 'security' && (
          <View style={{ gap: 16 }}>
            {/* Active Devices & Sessions Card */}
            <ActiveSessionsCard />

            {/* Password Change Card */}
            <View style={styles.tabContentCard}>
              <Text style={[styles.sectionHeading, isRTL && styles.textRight]}>
                {t('profile:security_credentials')}
              </Text>

              {pwdSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{pwdSuccessMsg}</Text></View>}
              {pwdErrorMsg && <ErrorBanner message={pwdErrorMsg} />}

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:current_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.textRight]}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#8e9192"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:new_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.textRight]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#8e9192"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, isRTL && styles.textRight]}>{t('profile:confirm_new_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.textRight]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#8e9192"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleChangePassword}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <ActivityIndicator size="small" color="#131313" />
                ) : (
                  <Text style={styles.primaryActionText}>{t('profile:change_password')}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>{t('profile:danger_zone')}</Text>
              <Text style={styles.dangerDesc}>{t('profile:danger_description')}</Text>
              <TouchableOpacity
                style={styles.deactivateBtn}
                onPress={() => setIsDeactivateModalVisible(true)}
              >
                <Text style={styles.deactivateBtnText}>{t('profile:deactivate_account')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: STORAGE & APP */}
        {activeTab === 'storage' && (
          <View style={styles.tabContentCard}>
            <Text style={[styles.sectionHeading, isRTL && styles.textRight]}>
              {t('profile:data_storage_title', { defaultValue: 'Data & App Storage' })}
            </Text>
            <Text style={[styles.sectionSubheading, isRTL && styles.textRight]}>
              {t('profile:data_storage_subtitle', { defaultValue: 'Manage temporary cached files, images, and local data' })}
            </Text>

            {storageMsg && <View style={styles.successBanner}><Text style={styles.successText}>{storageMsg}</Text></View>}

            <TouchableOpacity style={styles.clearCacheCardBtn} onPress={handleClearCache}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C9.01 19.43 10.93 20 13 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C14.99 4.57 13.07 4 11 4c-4.42 0-8 3.58-8 8H0l4 4 4-4H5z"
                  fill="#abc7ff"
                />
              </Svg>
              <Text style={styles.clearCacheText}>
                {t('profile:clear_cache_btn', { defaultValue: 'Clear Local App Cache' })}
              </Text>
            </TouchableOpacity>

            <View style={styles.versionFooter}>
              <Text style={styles.versionText}>
                {t('profile:app_version', { defaultValue: 'AutoCare AI v1.0.0 Twin Engine' })}
              </Text>
            </View>
          </View>
        )}

        {/* Global Sign Out Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                fill="#ffb4ab"
              />
            </Svg>
            <Text style={styles.logoutBtnText}>{t('profile:logout_button')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={isAvatarModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsAvatarModalVisible(false)}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>{t('profile:choose_avatar_preset')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile:select_avatar_subtitle')}</Text>

            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.name}
                  style={styles.presetItem}
                  onPress={() => {
                    useAuthStore.getState().updateUser({ avatarUrl: av.url });
                    setIsAvatarModalVisible(false);
                  }}
                >
                  <Image source={{ uri: av.url }} style={styles.presetImg} />
                  <Text style={styles.presetName}>{av.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {profile?.avatarUrl && (
              <TouchableOpacity
                style={styles.deleteAvatarBtn}
                onPress={() => {
                  deleteAvatar.mutate();
                  setIsAvatarModalVisible(false);
                }}
              >
                <Text style={styles.deleteAvatarText}>{t('profile:delete_avatar')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsAvatarModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Account Deactivation Modal */}
      <Modal visible={isDeactivateModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsDeactivateModalVisible(false)}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>{t('profile:confirm_account_deactivation')}</Text>
            <Text style={styles.modalSubtitle}>{t('profile:confirm_deactivation_subtitle')}</Text>

            {deactivateErrorMsg && <ErrorBanner message={deactivateErrorMsg} />}

            <TextInput
              style={styles.textInput}
              value={confirmDeactivatePassword}
              onChangeText={setConfirmDeactivatePassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#8e9192"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsDeactivateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t('common:cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmDeactivateBtn}
                onPress={handleDeactivate}
                disabled={deactivateAccount.isPending}
              >
                {deactivateAccount.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmDeactivateText}>
                    {t('profile:confirm_deactivation_button')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D11',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0D11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0D11',
    padding: 24,
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#131722',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContentCard: {
    backgroundColor: '#131722',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 14,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#181D2A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#F8FAFC',
  },
  primaryActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#181D2A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pillOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
  },
  dangerDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 14,
  },
  deactivateBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deactivateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  clearCacheCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181D2A',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  clearCacheText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  versionFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
  },
  logoutSection: {
    marginTop: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    height: 46,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#131722',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  presetItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: '#181D2A',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  presetImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
  },
  presetName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  deleteAvatarBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  deleteAvatarText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#181D2A',
    borderRadius: 10,
  },
  modalCloseText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#181D2A',
  },
  modalCancelText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalConfirmDeactivateBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#EF4444',
  },
  modalConfirmDeactivateText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

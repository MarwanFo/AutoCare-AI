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
import { PacksMembershipCard } from '@/features/profile/components/PacksMembershipCard';
import { useUserMembershipStatus } from '@/hooks/pack/usePacks';

import { ErrorBanner } from '@/features/auth/components/ErrorBanner';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useAuthStore } from '@/stores/authStore';
import { secureStore } from '@/storage/secureStore';
import { apiClient } from '@/api/client';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const PRESET_AVATARS = [
  { name: 'Classic Racer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { name: 'Urban Driver', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Night Rider', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { name: 'Tech Driver', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
];

export default function ProfileDashboardScreen() {
  const { t } = useAppTranslation(['profile', 'common', 'errors', 'validation']);
  const { isDark, colors, themeMode, setThemeMode } = useAppTheme();
  const { data: profile, isLoading, isError, refetch } = useUserProfile();
  const { data: vehiclesData } = useVehicles({ page: 0, size: 1 });
  const vehiclesCount = vehiclesData?.totalElements || 0;
  const { data: membershipStatus } = useUserMembershipStatus();

  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const changePassword = useChangePassword();
  const deactivateAccount = useDeactivateAccount();
  const queryClient = useQueryClient();

  const { currentLanguage, supportedLanguages, setLanguage, isRTL } = useLanguage();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'personal' | 'packs' | 'preferences' | 'security' | 'storage'>('personal');

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
          setPrefSuccessMsg(t('profile:preferences_saved_success'));
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
      setPwdErrorMsg(t('profile:fill_all_password_fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg(t('profile:passwords_do_not_match'));
      return;
    }

    if (newPassword.length < 8) {
      setPwdErrorMsg(t('profile:password_min_length'));
      return;
    }

    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setPwdSuccessMsg(t('profile:password_changed_success'));
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

  const handleClearCache = async () => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      setStorageMsg(t('profile:cache_cleared_success', { defaultValue: 'App cache cleared successfully!' }));
      setTimeout(() => setStorageMsg(null), 3500);
      refetch();
    } catch {
      setStorageMsg('Failed to clear local cache.');
    }
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
      <View style={[styles.loadingContainer, !isDark && styles.loadingContainerLight]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, !isDark && styles.loadingTextLight]}>{t('profile:syncing_profile')}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.errorContainer, !isDark && styles.errorContainerLight]}>
        <ErrorBanner message={t('profile:sync_failed')} />
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>{t('profile:retry_sync')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, !isDark && styles.containerLight]} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0D11' : '#F8FAFC'}
      />
      <View style={[styles.topGlow, !isDark && styles.topGlowLight]} pointerEvents="none" />
      <View style={[styles.bottomGlow, !isDark && styles.bottomGlowLight]} pointerEvents="none" />

      {/* Screen Top Header */}
      <View style={[styles.topNav, isRTL && styles.rowReverse]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.screenTitle, !isDark && styles.screenTitleLight, isRTL && styles.textRight]}>
            {t('profile:header_title')}
          </Text>
          <Text style={[styles.screenSubtitle, !isDark && styles.screenSubtitleLight, isRTL && styles.textRight]}>
            {t('profile:header_subtitle')}
          </Text>
        </View>

        {/* Quick Theme Toggle in Top Header */}
        <ThemeToggle />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Profile Hero Header Card */}
        <ProfileHeaderCard
          fullName={profile?.fullName || ''}
          email={profile?.email}
          phoneNumber={profile?.phoneNumber}
          avatarUrl={profile?.avatarUrl}
          onEditAvatarPress={() => setIsAvatarModalVisible(true)}
          vehiclesCount={vehiclesCount}
          planName={membershipStatus?.currentPack?.name || 'Starter Free'}
          aiCredits={membershipStatus?.aiCredits ?? 10}
          onPlanPress={() => setActiveTab('packs')}
        />

        {/* Navigation Tabs Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={[styles.tabContainer, !isDark && styles.tabContainerLight]}>
            {[
              { id: 'personal', label: t('profile:tab_personal', { defaultValue: 'Personal' }) },
              { id: 'packs', label: 'Forfaits & Plans 💎' },
              { id: 'preferences', label: t('profile:tab_preferences', { defaultValue: 'Preferences' }) },
              { id: 'security', label: t('profile:tab_security', { defaultValue: 'Security & Sessions' }) },
              { id: 'storage', label: t('profile:tab_storage', { defaultValue: 'Storage & App' }) },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  !isDark && styles.tabItemLight,
                  activeTab === tab.id && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text
                  style={[
                    styles.tabText,
                    !isDark && styles.tabTextLight,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <View style={[styles.tabContentCard, !isDark && styles.tabContentCardLight]}>
            <Text style={[styles.sectionHeading, !isDark && styles.sectionHeadingLight, isRTL && styles.textRight]}>
              {t('profile:personal_details')}
            </Text>

            {profileSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{profileSuccessMsg}</Text></View>}
            {profileErrorMsg && <ErrorBanner message={profileErrorMsg} />}

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:full_name')}</Text>
              <TextInput
                style={[styles.textInput, !isDark && styles.textInputLight, isRTL && styles.textRight]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Driver Name"
                placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:phone_number')}</Text>
              <TextInput
                style={[styles.textInput, !isDark && styles.textInputLight, isRTL && styles.textRight]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="+1 234 567 8900"
                placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleUpdateProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryActionText}>{t('profile:save_details')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB: FORFAITS & PLANS */}
        {activeTab === 'packs' && (
          <PacksMembershipCard />
        )}

        {/* TAB 2: PREFERENCES */}
        {activeTab === 'preferences' && (
          <View style={[styles.tabContentCard, !isDark && styles.tabContentCardLight]}>
            <Text style={[styles.sectionHeading, !isDark && styles.sectionHeadingLight, isRTL && styles.textRight]}>
              {t('profile:app_preferences')}
            </Text>

            {prefSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{prefSuccessMsg}</Text></View>}
            {prefErrorMsg && <ErrorBanner message={prefErrorMsg} />}

            {/* Appearance Theme Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>
                {t('profile:theme_mode', { defaultValue: 'Appearance & Theme' })}
              </Text>
              <View style={styles.pillRow}>
                {[
                  { mode: 'dark', label: '🌙 Dark Mode' },
                  { mode: 'light', label: '☀️ Light Mode' },
                  { mode: 'system', label: '📱 System Default' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.mode}
                    style={[
                      styles.pillOption,
                      !isDark && styles.pillOptionLight,
                      themeMode === item.mode && (isDark ? styles.pillOptionActive : styles.pillOptionActiveLight),
                    ]}
                    onPress={() => setThemeMode(item.mode as any)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        !isDark && styles.pillTextLight,
                        themeMode === item.mode && (isDark ? styles.pillTextActive : styles.pillTextActiveLightText),
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Language Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:language')}</Text>
              <View style={styles.pillRow}>
                {[
                  { code: 'EN', label: 'English', target: 'en' },
                  { code: 'FR', label: 'Français', target: 'fr' },
                  { code: 'AR', label: 'العربية', target: 'ar' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.pillOption,
                      !isDark && styles.pillOptionLight,
                      (currentLanguage.toUpperCase() === item.code || lang === item.code) && (isDark ? styles.pillOptionActive : styles.pillOptionActiveLight),
                    ]}
                    onPress={() => {
                      setLang(item.code as any);
                      setLanguage(item.target as any);
                    }}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        !isDark && styles.pillTextLight,
                        (currentLanguage.toUpperCase() === item.code || lang === item.code) && (isDark ? styles.pillTextActive : styles.pillTextActiveLightText),
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Currency Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:currency')}</Text>
              <View style={styles.pillRow}>
                {['EUR', 'USD', 'MAD', 'GBP'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.pillOption,
                      !isDark && styles.pillOptionLight,
                      currency === curr && (isDark ? styles.pillOptionActive : styles.pillOptionActiveLight),
                    ]}
                    onPress={() => setCurrency(curr as any)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        !isDark && styles.pillTextLight,
                        currency === curr && (isDark ? styles.pillTextActive : styles.pillTextActiveLightText),
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Unit Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:distance_unit')}</Text>
              <View style={styles.pillRow}>
                {[
                  { code: 'KM', label: t('profile:kilometers') },
                  { code: 'MILES', label: t('profile:miles') },
                ].map((u) => (
                  <TouchableOpacity
                    key={u.code}
                    style={[
                      styles.pillOption,
                      !isDark && styles.pillOptionLight,
                      unit === u.code && (isDark ? styles.pillOptionActive : styles.pillOptionActiveLight),
                    ]}
                    onPress={() => setUnit(u.code as any)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        !isDark && styles.pillTextLight,
                        unit === u.code && (isDark ? styles.pillTextActive : styles.pillTextActiveLightText),
                      ]}
                    >
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notification Toggles */}
            <View style={[styles.switchRow, !isDark && styles.switchRowLight, isRTL && styles.rowReverse]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, !isDark && styles.switchTitleLight]}>{t('profile:push_notifications_title')}</Text>
                <Text style={[styles.switchSubtitle, !isDark && styles.switchSubtitleLight]}>{t('profile:push_notifications_subtitle')}</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                thumbColor={pushEnabled ? '#3B82F6' : (isDark ? '#444748' : '#CBD5E1')}
                trackColor={{ false: isDark ? '#2a2a2a' : '#E2E8F0', true: 'rgba(59, 130, 246, 0.4)' }}
              />
            </View>

            <View style={[styles.switchRow, !isDark && styles.switchRowLight, isRTL && styles.rowReverse]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.switchTitle, !isDark && styles.switchTitleLight]}>{t('profile:email_notifications_title')}</Text>
                <Text style={[styles.switchSubtitle, !isDark && styles.switchSubtitleLight]}>{t('profile:email_notifications_subtitle')}</Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                thumbColor={emailEnabled ? '#3B82F6' : (isDark ? '#444748' : '#CBD5E1')}
                trackColor={{ false: isDark ? '#2a2a2a' : '#E2E8F0', true: 'rgba(59, 130, 246, 0.4)' }}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleUpdatePreferences}
              disabled={updatePreferences.isPending}
            >
              {updatePreferences.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
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
            <View style={[styles.tabContentCard, !isDark && styles.tabContentCardLight]}>
              <Text style={[styles.sectionHeading, !isDark && styles.sectionHeadingLight, isRTL && styles.textRight]}>
                {t('profile:security_credentials')}
              </Text>

              {pwdSuccessMsg && <View style={styles.successBanner}><Text style={styles.successText}>{pwdSuccessMsg}</Text></View>}
              {pwdErrorMsg && <ErrorBanner message={pwdErrorMsg} />}

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:current_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, !isDark && styles.textInputLight, isRTL && styles.textRight]}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:new_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, !isDark && styles.textInputLight, isRTL && styles.textRight]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, !isDark && styles.inputLabelLight, isRTL && styles.textRight]}>{t('profile:confirm_new_password_label')}</Text>
                <TextInput
                  style={[styles.textInput, !isDark && styles.textInputLight, isRTL && styles.textRight]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleChangePassword}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
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
          <View style={[styles.tabContentCard, !isDark && styles.tabContentCardLight]}>
            <Text style={[styles.sectionHeading, !isDark && styles.sectionHeadingLight, isRTL && styles.textRight]}>
              {t('profile:data_storage_title', { defaultValue: 'Data & App Storage' })}
            </Text>
            <Text style={[styles.sectionSubheading, !isDark && styles.sectionSubheadingLight, isRTL && styles.textRight]}>
              {t('profile:data_storage_subtitle', { defaultValue: 'Manage temporary cached files, images, and local data' })}
            </Text>

            {storageMsg && <View style={styles.successBanner}><Text style={styles.successText}>{storageMsg}</Text></View>}

            <TouchableOpacity style={[styles.clearCacheCardBtn, !isDark && styles.clearCacheCardBtnLight]} onPress={handleClearCache}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C9.01 19.43 10.93 20 13 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C14.99 4.57 13.07 4 11 4c-4.42 0-8 3.58-8 8H0l4 4 4-4H5z"
                  fill="#3B82F6"
                />
              </Svg>
              <Text style={styles.clearCacheText}>
                {t('profile:clear_cache_btn', { defaultValue: 'Clear Local App Cache' })}
              </Text>
            </TouchableOpacity>

            <View style={styles.versionFooter}>
              <Text style={[styles.versionText, !isDark && styles.versionTextLight]}>
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
                fill="#EF4444"
              />
            </Svg>
            <Text style={styles.logoutBtnText}>{t('profile:logout_button')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={isAvatarModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsAvatarModalVisible(false)}>
          <View style={[styles.modalContentCard, !isDark && styles.modalContentCardLight]}>
            <Text style={[styles.modalTitle, !isDark && styles.modalTitleLight]}>{t('profile:choose_avatar_preset')}</Text>
            <Text style={[styles.modalSubtitle, !isDark && styles.modalSubtitleLight]}>{t('profile:select_avatar_subtitle')}</Text>

            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.name}
                  style={[styles.presetItem, !isDark && styles.presetItemLight]}
                  onPress={() => {
                    useAuthStore.getState().updateUser({ avatarUrl: av.url });
                    setIsAvatarModalVisible(false);
                  }}
                >
                  <Image source={{ uri: av.url }} style={styles.presetImg} />
                  <Text style={[styles.presetName, !isDark && styles.presetNameLight]}>{av.name}</Text>
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
              style={[styles.modalCloseBtn, !isDark && styles.modalCloseBtnLight]}
              onPress={() => setIsAvatarModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, !isDark && styles.modalCloseTextLight]}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Account Deactivation Modal */}
      <Modal visible={isDeactivateModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsDeactivateModalVisible(false)}>
          <View style={[styles.modalContentCard, !isDark && styles.modalContentCardLight]}>
            <Text style={[styles.modalTitle, !isDark && styles.modalTitleLight]}>{t('profile:confirm_account_deactivation')}</Text>
            <Text style={[styles.modalSubtitle, !isDark && styles.modalSubtitleLight]}>{t('profile:confirm_deactivation_subtitle')}</Text>

            {deactivateErrorMsg && <ErrorBanner message={deactivateErrorMsg} />}

            <TextInput
              style={[styles.textInput, !isDark && styles.textInputLight]}
              value={confirmDeactivatePassword}
              onChangeText={setConfirmDeactivatePassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#8e9192' : '#94A3B8'}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, !isDark && styles.modalCancelBtnLight]}
                onPress={() => setIsDeactivateModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, !isDark && styles.modalCancelTextLight]}>{t('common:cancel')}</Text>
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
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0D11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerLight: {
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  loadingTextLight: {
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0D11',
    padding: 24,
    justifyContent: 'center',
  },
  errorContainerLight: {
    backgroundColor: '#F8FAFC',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  screenTitleLight: {
    color: '#0F172A',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3B82F6',
    opacity: 0.08,
  },
  topGlowLight: {
    opacity: 0.04,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1D4ED8',
    opacity: 0.06,
  },
  bottomGlowLight: {
    opacity: 0.03,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  screenSubtitleLight: {
    color: '#64748B',
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
    backgroundColor: '#141824',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContainerLight: {
    backgroundColor: '#E2E8F0',
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  tabItem: {
    minWidth: 95,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabItemLight: {},
  tabItemActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextLight: {
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContentCard: {
    backgroundColor: '#141824',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  tabContentCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
  },
  sectionHeadingLight: {
    color: '#0F172A',
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 14,
  },
  sectionSubheadingLight: {
    color: '#64748B',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  inputLabelLight: {
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#181D2A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14,
    color: '#F8FAFC',
    justifyContent: 'center',
  },
  textInputLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    color: '#0F172A',
  },
  primaryActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#181D2A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pillOptionLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  pillOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  pillOptionActiveLight: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextLight: {
    color: '#64748B',
  },
  pillTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  pillTextActiveLightText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  switchRowLight: {
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  switchTitleLight: {
    color: '#0F172A',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  switchSubtitleLight: {
    color: '#94A3B8',
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
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
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deactivateBtnText: {
    fontSize: 13,
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
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  clearCacheCardBtnLight: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.08)',
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
  versionTextLight: {
    color: '#94A3B8',
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
    borderRadius: 14,
    height: 50,
  },
  logoutBtnText: {
    fontSize: 14,
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
  modalContentCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  modalTitleLight: {
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 16,
  },
  modalSubtitleLight: {
    color: '#64748B',
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
  presetItemLight: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.08)',
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
  presetNameLight: {
    color: '#0F172A',
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
  modalCloseBtnLight: {
    backgroundColor: '#F1F5F9',
  },
  modalCloseText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalCloseTextLight: {
    color: '#0F172A',
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
  modalCancelBtnLight: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalCancelTextLight: {
    color: '#0F172A',
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

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSessions, useRevokeSession, useLogoutAllSessions } from '@/hooks/user/useSessions';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useLanguage } from '@/i18n/hooks/useLanguage';

export function ActiveSessionsCard() {
  const { t } = useAppTranslation(['profile', 'common']);
  const { isRTL } = useLanguage();

  const { data: sessions = [], isLoading, isError, refetch } = useSessions();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAllSessions();

  const handleRevoke = (sessionId: string) => {
    Alert.alert(
      t('profile:revoke_session_confirm_title', { defaultValue: 'Revoke Device Session' }),
      t('profile:revoke_session_confirm_msg', { defaultValue: 'Are you sure you want to log out this device remotely?' }),
      [
        { text: t('common:cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('profile:revoke_session', { defaultValue: 'Revoke' }),
          style: 'destructive',
          onPress: () => revokeMutation.mutate(sessionId),
        },
      ]
    );
  };

  const handleLogoutAllOther = () => {
    Alert.alert(
      t('profile:logout_all_confirm_title', { defaultValue: 'Log Out All Other Devices' }),
      t('profile:logout_all_confirm_msg', { defaultValue: 'This will immediately revoke access on all other phones, tablets, or web browsers.' }),
      [
        { text: t('common:cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('profile:logout_all_sessions', { defaultValue: 'Log Out All Other Devices' }),
          style: 'destructive',
          onPress: () => logoutAllMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#abc7ff" />
        <Text style={styles.loadingText}>Loading active sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isRTL && styles.textRight]}>
            {t('profile:active_sessions_title', { defaultValue: 'Active Devices & Sessions' })}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.textRight]}>
            {t('profile:active_sessions_subtitle', { defaultValue: 'Manage device sessions currently logged into your account' })}
          </Text>
        </View>

        {sessions.length > 1 && (
          <TouchableOpacity
            style={styles.logoutAllBtn}
            onPress={handleLogoutAllOther}
            disabled={logoutAllMutation.isPending}
          >
            {logoutAllMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffb4ab" />
            ) : (
              <Text style={styles.logoutAllText}>Revoke Others</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sessionList}>
        {sessions.map((sess, idx) => {
          const ua = (sess?.userAgent || '').toLowerCase();
          const isWeb = ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari');
          const sessionKey = sess?.id || `session-${idx}`;
          return (
            <View key={sessionKey} style={[styles.sessionRow, isRTL && styles.rowReverse]}>
              <View style={styles.deviceIconBox}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {isWeb ? (
                    <Path
                      d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"
                      fill="#abc7ff"
                    />
                  ) : (
                    <Path
                      d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"
                      fill="#abc7ff"
                    />
                  )}
                </Svg>
              </View>

              <View style={[styles.sessionDetails, isRTL && styles.alignRight]}>
                <View style={[styles.deviceTitleRow, isRTL && styles.rowReverse]}>
                  <Text style={styles.deviceType}>
                    {sess.deviceType || (isWeb ? 'Web Browser' : 'Mobile App')}
                  </Text>
                  {sess.isCurrentSession && (
                    <View style={styles.thisDeviceBadge}>
                      <Text style={styles.thisDeviceText}>
                        {t('profile:this_device', { defaultValue: 'This Device' })}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.sessionMeta}>
                  IP: {sess.ipAddress || '127.0.0.1'} • {sess.lastActiveAt ? new Date(sess.lastActiveAt).toLocaleDateString() : 'Just now'}
                </Text>
              </View>

              {!sess.isCurrentSession && (
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(sess.id)}
                  disabled={revokeMutation.isPending}
                >
                  <Text style={styles.revokeBtnText}>
                    {t('profile:revoke_session', { defaultValue: 'Revoke' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#8e9192',
    fontFamily: 'Inter',
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  textRight: {
    textAlign: 'right',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
    lineHeight: 16,
  },
  logoutAllBtn: {
    backgroundColor: '#ffb4ab15',
    borderColor: '#ffb4ab30',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutAllText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#ffb4ab',
  },
  sessionList: {
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131313',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 12,
  },
  deviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#abc7ff15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceType: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  thisDeviceBadge: {
    backgroundColor: '#34c75920',
    borderColor: '#34c75940',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  thisDeviceText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#34c759',
  },
  sessionMeta: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#8e9192',
    marginTop: 2,
  },
  revokeBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  revokeBtnText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#ffb4ab',
  },
});

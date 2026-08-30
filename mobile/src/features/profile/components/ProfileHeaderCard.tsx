import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

interface ProfileHeaderCardProps {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  onEditAvatarPress: () => void;
  vehiclesCount?: number;
}

export function ProfileHeaderCard({
  fullName,
  email,
  phoneNumber,
  avatarUrl,
  onEditAvatarPress,
  vehiclesCount = 0,
}: ProfileHeaderCardProps) {
  const { t } = useAppTranslation(['profile', 'common']);
  const { isRTL } = useLanguage();

  const getInitials = (name: string) => {
    if (!name) return 'AC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.glowBg} />

      <View style={[styles.contentRow, isRTL && styles.rowReverse]}>
        {/* Avatar with Camera badge */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={onEditAvatarPress}
          activeOpacity={0.85}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
            </View>
          )}
          <View style={styles.badgeOverlay}>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
                fill="#FFFFFF"
              />
              <Path
                d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                fill="#FFFFFF"
              />
            </Svg>
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View style={[styles.infoColumn, isRTL && styles.alignRight]}>
          <Text style={[styles.userName, isRTL && styles.textRight]} numberOfLines={1}>
            {fullName || 'Driver'}
          </Text>

          {email ? (
            <View style={[styles.emailRow, isRTL && styles.rowReverse]}>
              <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill="#94A3B8"
                />
              </Svg>
              <Text style={styles.userEmail} numberOfLines={1}>
                {email}
              </Text>
            </View>
          ) : null}

          {/* Badges */}
          <View style={[styles.badgesRow, isRTL && styles.rowReverse]}>
            <View style={styles.verifiedBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.verifiedText}>
                {t('profile:security_status', { defaultValue: 'Account Secured' })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Divider Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{vehiclesCount}</Text>
          <Text style={styles.statLbl}>Vehicles</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statVal}>100%</Text>
          <Text style={styles.statLbl}>Digital Twin</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#10B981' }]}>ACTIVE</Text>
          <Text style={styles.statLbl}>Status</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131722',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg: {
    display: 'none',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  avatarWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#181D2A',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3B82F6',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#131722',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181D2A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLbl: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});

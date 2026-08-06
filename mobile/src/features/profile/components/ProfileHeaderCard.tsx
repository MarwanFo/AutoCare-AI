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
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
                fill="#131313"
              />
              <Path
                d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                fill="#131313"
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
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill="#abc7ff"
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
          <Text style={styles.statVal}>ACTIVE</Text>
          <Text style={styles.statLbl}>Status</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#abc7ff',
    opacity: 0.05,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#abc7ff',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#27272a',
    borderWidth: 2,
    borderColor: '#abc7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#abc7ff',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#abc7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1c1c',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  userEmail: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#34c75915',
    borderColor: '#34c75940',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34c759',
  },
  verifiedText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#34c759',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131313',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#abc7ff',
  },
  statLbl: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#8e9192',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272a',
  },
});

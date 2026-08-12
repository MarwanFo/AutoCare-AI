import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, NotificationItem } from '@/hooks/notification/useNotifications';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { resolveComponentName } from '@/features/vehicle/utils/componentResolver';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectNotification?: (vehicleId: string, tab: 'COMPONENTS' | 'DOCUMENTS') => void;
}

export function NotificationModal({ visible, onClose, onSelectNotification }: NotificationModalProps) {
  const { t } = useAppTranslation(['notifications', 'common']);
  const { isRTL } = useRTL();
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleItemPress = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    if (item.vehicleId && onSelectNotification) {
      const targetTab = item.documentId ? 'DOCUMENTS' : 'COMPONENTS';
      onSelectNotification(item.vehicleId, targetTab);
      onClose();
    }
  };

  const renderNotificationText = (item: NotificationItem) => {
    const type = item.type;
    const vehicleName = item.vehicleTitle || t('notifications:default_vehicle');

    if (type === 'COMPONENT_CRITICAL') {
      const compName = resolveComponentName(item.componentCode, t);
      const health = item.healthScore ?? 0;
      return {
        title: item.title || t('notifications:types.component_critical_title'),
        message: item.message || t('notifications:types.component_critical_msg', { componentName: compName, vehicleTitle: vehicleName, health }),
      };
    } else if (type === 'COMPONENT_WARNING') {
      const compName = resolveComponentName(item.componentCode, t);
      return {
        title: item.title || t('notifications:types.component_warning_title'),
        message: item.message || t('notifications:types.component_warning_msg', { componentName: compName, vehicleTitle: vehicleName }),
      };
    } else if (type === 'COMPONENT_DATA_REQUIRED') {
      const compName = resolveComponentName(item.componentCode, t);
      return {
        title: item.title || t('notifications:types.component_data_required_title'),
        message: item.message || t('notifications:types.component_data_required_msg', { componentName: compName, vehicleTitle: vehicleName }),
      };
    } else if (type === 'DOCUMENT_EXPIRING') {
      const docTitle = item.documentTitle || t('notifications:default_document');
      return {
        title: item.title || t('notifications:types.document_expiring_title'),
        message: item.message || t('notifications:types.document_expiring_msg', { documentTitle: docTitle, vehicleTitle: vehicleName, expiryDate: item.expiryDate || '' }),
      };
    } else if (type === 'DOCUMENT_EXPIRED') {
      const docTitle = item.documentTitle || t('notifications:default_document');
      return {
        title: item.title || t('notifications:types.document_expired_title'),
        message: item.message || t('notifications:types.document_expired_msg', { documentTitle: docTitle, vehicleTitle: vehicleName, expiryDate: item.expiryDate || '' }),
      };
    }

    return {
      title: item.title,
      message: item.message,
    };
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'DANGER':
        return { bg: 'rgba(255, 180, 171, 0.15)', border: 'rgba(255, 180, 171, 0.4)', text: '#ffb4ab' };
      case 'WARNING':
        return { bg: 'rgba(255, 223, 150, 0.15)', border: 'rgba(255, 223, 150, 0.4)', text: '#ffdf96' };
      default:
        return { bg: 'rgba(171, 199, 255, 0.15)', border: 'rgba(171, 199, 255, 0.4)', text: '#abc7ff' };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                  fill="#abc7ff"
                />
              </Svg>
              <Text style={styles.headerTitle}>{t('notifications:title')}</Text>
            </View>

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity
                  onPress={() => markAllReadMutation.mutate()}
                  style={styles.markAllButton}
                >
                  <Text style={styles.markAllText}>{t('notifications:mark_all_read')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                    fill="#c4c6d0"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#abc7ff" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                  fill="rgba(196, 198, 208, 0.3)"
                />
              </Svg>
              <Text style={styles.emptyTitle}>{t('notifications:empty_title')}</Text>
              <Text style={styles.emptySubtitle}>{t('notifications:empty_subtitle')}</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const colors = getSeverityBadgeColor(item.severity);
                const textInfo = renderNotificationText(item);

                return (
                  <TouchableOpacity
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.8}
                    style={[
                      styles.notificationCard,
                      !item.isRead && styles.unreadCard,
                      { borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>
                          {item.severity}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {textInfo.title}
                    </Text>

                    <Text style={[styles.cardMessage, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {textInfo.message}
                    </Text>

                    {item.vehicleId && (
                      <View style={[styles.actionHintRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={styles.actionHintText}>{t('notifications:tap_to_view')}</Text>
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <Path
                            d={isRTL ? "M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" : "M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"}
                            fill="#abc7ff"
                          />
                        </Svg>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1b1b1f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e2e6',
  },
  markAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(171, 199, 255, 0.12)',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#abc7ff',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e2e6',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e9099',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#252529',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  unreadCard: {
    backgroundColor: '#2d2d33',
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#8e9099',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e2e6',
  },
  cardMessage: {
    fontSize: 13,
    color: '#c4c6d0',
    lineHeight: 18,
  },
  actionHintRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  actionHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#abc7ff',
  },
});

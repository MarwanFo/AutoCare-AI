import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVehicle } from '@/hooks/vehicle/useVehicle';
import { Spacing } from '@/constants/theme';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';
import { useRTL } from '@/i18n/hooks/useRTL';
import { resolveCategoryLabel, resolveComponentName } from '../utils/componentResolver';
import { AddComponentModal } from './AddComponentModal';
import { AddDocumentModal } from './AddDocumentModal';
import { AddIntervalModal } from './AddIntervalModal';
import { RecordReplacementModal } from './RecordReplacementModal';
import { useDeleteComponent, useDeleteDocument, useDeleteInterval } from '@/hooks/vehicle/useVehicleMutations';
import { UserComponent } from '@/types/vehicle';

import { AiAdvisorTab } from './AiAdvisorTab';
import { CostBudgetCard } from './CostBudgetCard';
import { vehicleAdvisorApi } from '@/api/vehicleAdvisorApi';
import { Alert, Share } from 'react-native';

interface VehicleDetailsModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

type TabType = 'COMPONENTS' | 'BUDGET' | 'AI_ADVISOR' | 'DOCUMENTS' | 'INTERVALS' | 'SPECS';

export function VehicleDetailsModal({ vehicleId, visible, onClose, initialTab = 'COMPONENTS' }: VehicleDetailsModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddInterval, setShowAddInterval] = useState(false);
  const [selectedCompForDate, setSelectedCompForDate] = useState<UserComponent | null>(null);

  const deleteComponentMutation = useDeleteComponent(vehicleId);
  const deleteDocumentMutation = useDeleteDocument(vehicleId);
  const deleteIntervalMutation = useDeleteInterval(vehicleId);

  const openDocumentUrl = async (url?: string) => {
    if (!url) return;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    try {
      await Linking.openURL(targetUrl);
    } catch (err) {
      console.error("Failed to open document URL:", err);
    }
  };

  const getHealthColor = (score?: number | null) => {
    if (score === undefined || score === null) return '#64748B'; // Slate for UNKNOWN
    if (score >= 80) return '#10B981'; // Emerald Green
    if (score >= 50) return '#F59E0B'; // Instrument Amber
    return '#EF4444'; // Brembo Crimson
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {vehicle ? `${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}` : 'Vehicle Details'}
              </Text>
              {vehicle?.nickname && (
                <Text style={styles.headerNickname}>"{vehicle.nickname}"</Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="#94A3B8"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Fetching digital twin telemetry...</Text>
            </View>
          ) : error || !vehicle ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load vehicle details.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onClose}>
                <Text style={styles.retryButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* Vehicle Sub-Info */}
              <View style={[styles.metaRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {vehicle.purchaseCondition === 'BRAND_NEW'
                      ? t('maintenance:condition.brand_new')
                      : t('maintenance:condition.used')}
                  </Text>
                </View>
                {vehicle.licensePlate && (
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{vehicle.licensePlate.toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {vehicle.currentMileage?.toLocaleString()} {vehicle.mileageUnit || 'KM'}
                  </Text>
                </View>
              </View>

              {/* Action & Tabs Navigation */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={[styles.tabBar, isRTL && { flexDirection: 'row-reverse' }]}>
                    {(['COMPONENTS', 'BUDGET', 'AI_ADVISOR', 'DOCUMENTS', 'INTERVALS', 'SPECS'] as TabType[]).map((tab) => (
                      <TouchableOpacity
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                      >
                        <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                          {tab === 'AI_ADVISOR' ? 'AI Advisor' : tab === 'BUDGET' ? 'Budget' : t(`maintenance:tabs.${tab.toLowerCase()}`, { defaultValue: tab })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onPress={async () => {
                    try {
                      const rep = await vehicleAdvisorApi.getHealthReport(vehicleId);
                      if (rep) {
                        Share.share({
                          title: `${vehicle.year} ${vehicle.brandName} Health Report`,
                          message: `Vehicle: ${rep.vehicleTitle}\nOverall Health: ${rep.overallHealthScore}%\nMileage: ${rep.currentMileage.toLocaleString()} ${rep.mileageUnit}\nCritical Alerts: ${rep.criticalWarnings?.length || 0}\n\nAutoCare-AI Digital Twin`,
                        });
                      }
                    } catch (e) {
                      Alert.alert('Report Export', 'Diagnostic report generated successfully.');
                    }
                  }}
                >
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" fill="#3B82F6" />
                  </Svg>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {activeTab === 'BUDGET' && (
                  <CostBudgetCard components={vehicle.components} />
                )}

                {activeTab === 'AI_ADVISOR' && (
                  <AiAdvisorTab
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.year} ${vehicle.brandName} ${vehicle.modelName}`}
                  />
                )}

                {activeTab === 'COMPONENTS' && (
                  <View style={styles.tabContentContainer}>
                    <View style={[styles.sectionHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('maintenance:components.title')}</Text>
                      <TouchableOpacity
                        style={[styles.addInlineBtn, isRTL && { flexDirection: 'row-reverse' }]}
                        onPress={() => setShowAddComponent(true)}
                      >
                        <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#3B82F6" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_component_short', { defaultValue: '+ Add Piece' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.components?.some((c) => (c.healthScore ?? 100) < 25) && (
                      <View style={[styles.dangerBanner, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444" />
                        </Svg>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dangerBannerTitle, isRTL && { textAlign: 'right' }]}>
                            {t('maintenance:danger.banner_title', { defaultValue: 'CRITICAL SAFETY WARNING' })}
                          </Text>
                          <Text style={[styles.dangerBannerSub, isRTL && { textAlign: 'right' }]}>
                            {t('maintenance:danger.banner_subtitle', { defaultValue: 'One or more vehicle components have reached critical wear. Inspect car immediately!' })}
                          </Text>
                        </View>
                      </View>
                    )}

                    {vehicle.components?.some((c) => (c as any).status === 'UNKNOWN' || c.healthScore === null) && (
                      <View style={[styles.unknownHintBanner, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3B82F6" />
                        </Svg>
                        <Text style={[styles.unknownHintText, isRTL && { textAlign: 'right' }]}>
                          {t('maintenance:reminders.add_dates_hint', { defaultValue: 'Some components have missing replacement dates. Tap "Set Replacement Date" on any piece to calculate health.' })}
                        </Text>
                      </View>
                    )}

                    {vehicle.components && vehicle.components.length > 0 ? (
                      vehicle.components.map((comp) => {
                        const healthCol = getHealthColor(comp.healthScore);
                        const isUnknown = comp.healthScore === null || (comp as any).status === 'UNKNOWN';
                        return (
                          <View key={comp.id} style={styles.componentCard}>
                            <View style={[styles.componentHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.componentName, isRTL && { textAlign: 'right' }]}>
                                  {resolveComponentName(comp.name, (comp as any).canonicalCode, (comp as any).isCustom, t)}
                                </Text>
                                <Text style={[styles.componentCategory, isRTL && { textAlign: 'right' }]}>
                                  {resolveCategoryLabel(comp.category, t)}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={[styles.healthBadge, { backgroundColor: `${healthCol}18` }]}>
                                  <Text style={[styles.healthText, { color: healthCol }]}>
                                    {comp.healthScore !== null && comp.healthScore !== undefined
                                      ? t('maintenance:reminders.health_percentage', { percentage: comp.healthScore, defaultValue: `${comp.healthScore}% Health` })
                                      : t('maintenance:reminders.insufficient_data', { defaultValue: 'Not enough data' })}
                                  </Text>
                                </View>
                                {(comp as any).isCustom && (
                                  <TouchableOpacity
                                    style={styles.deleteCardBtn}
                                    onPress={() => deleteComponentMutation.mutate(comp.id)}
                                  >
                                    <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                      <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
                                    </Svg>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            <View style={styles.healthBarBg}>
                              <View
                                style={[
                                  styles.healthBarFill,
                                  { width: `${comp.healthScore ?? 0}%` as const, backgroundColor: healthCol },
                                ]}
                              />
                            </View>

                            <View style={[styles.lifespanRow, isRTL && { flexDirection: 'row-reverse' }]}>
                              {(comp as any).remainingMileage !== undefined && (comp as any).remainingMileage !== null && (
                                <View style={styles.lifespanBadge}>
                                  <Text style={styles.lifespanBadgeText}>
                                    {((comp as any).remainingMileage ?? 0).toLocaleString()} {vehicle.mileageUnit}
                                  </Text>
                                </View>
                              )}
                              {(comp as any).remainingDays !== undefined && (comp as any).remainingDays !== null && (
                                <View style={styles.lifespanBadge}>
                                  <Text style={styles.lifespanBadgeText}>
                                    {(comp as any).remainingDays ?? 0} days
                                  </Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.componentMetaGrid}>
                              {comp.partNumber && (
                                <View style={styles.componentMetaItem}>
                                  <Text style={styles.metaLabel}>{t('maintenance:components.part_number')}</Text>
                                  <Text style={styles.metaValue}>{comp.partNumber}</Text>
                                </View>
                              )}
                              {comp.specifications && (
                                <View style={styles.componentMetaItem}>
                                  <Text style={styles.metaLabel}>{t('maintenance:components.specifications')}</Text>
                                  <Text style={styles.metaValue}>{comp.specifications}</Text>
                                </View>
                              )}
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.setReplacementDateBtn,
                                isUnknown && styles.setReplacementDateBtnHighlight,
                                isRTL && { flexDirection: 'row-reverse' },
                              ]}
                              onPress={() => setSelectedCompForDate(comp)}
                            >
                              <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <Path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill={isUnknown ? '#FFFFFF' : '#3B82F6'} />
                              </Svg>
                              <Text
                                style={[
                                  styles.setReplacementDateBtnText,
                                  isUnknown && styles.setReplacementDateBtnTextHighlight,
                                ]}
                              >
                                {isUnknown
                                  ? t('maintenance:actions.set_replacement_date', { defaultValue: '+ Set Date' })
                                  : t('maintenance:actions.update_replacement_date', { defaultValue: 'Update Date' })}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('maintenance:components.no_components')}</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'DOCUMENTS' && (
                  <View style={styles.tabContentContainer}>
                    <View style={[styles.sectionHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('maintenance:documents_section.title')}</Text>
                      <TouchableOpacity
                        style={[styles.addInlineBtn, isRTL && { flexDirection: 'row-reverse' }]}
                        onPress={() => setShowAddDocument(true)}
                      >
                        <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#3B82F6" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_document_short', { defaultValue: '+ Add Document' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.documents && vehicle.documents.length > 0 ? (
                      vehicle.documents.map((doc) => (
                        <View key={doc.id} style={styles.documentCard}>
                          <View style={styles.documentIconWrapper}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
                                fill="#3B82F6"
                              />
                            </Svg>
                          </View>
                          <View style={styles.documentInfo}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={[styles.documentTitle, isRTL && { textAlign: 'right' }, { flex: 1 }]}>{doc.title}</Text>
                              <TouchableOpacity
                                style={styles.deleteCardBtn}
                                onPress={() => deleteDocumentMutation.mutate(doc.id)}
                              >
                                <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                  <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
                                </Svg>
                              </TouchableOpacity>
                            </View>
                            {doc.notes && <Text style={[styles.documentNotes, isRTL && { textAlign: 'right' }]}>{doc.notes}</Text>}
                            <TouchableOpacity
                              style={[styles.viewDocButton, isRTL && { flexDirection: 'row-reverse' }]}
                              onPress={() => openDocumentUrl(doc.url)}
                            >
                              <Text style={styles.viewDocText}>{t('maintenance:documents_section.view_pdf')}</Text>
                              <Svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                                <Path
                                  d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z"
                                  fill="#3B82F6"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('maintenance:documents_section.no_documents')}</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'INTERVALS' && (
                  <View style={styles.tabContentContainer}>
                    <View style={[styles.sectionHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('maintenance:service.intervals')}</Text>
                      <TouchableOpacity
                        style={[styles.addInlineBtn, isRTL && { flexDirection: 'row-reverse' }]}
                        onPress={() => setShowAddInterval(true)}
                      >
                        <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#3B82F6" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_interval_short', { defaultValue: '+ Add Interval' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.intervals && vehicle.intervals.length > 0 ? (
                      vehicle.intervals.map((inv) => (
                        <View key={inv.id} style={styles.intervalCard}>
                          <View style={styles.intervalHeader}>
                            <Text style={styles.intervalTitle}>{inv.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={styles.intervalBadge}>
                                <Text style={styles.intervalBadgeText}>
                                  {(inv as any).inspectionOnly ? t('maintenance:service.inspection') : t('maintenance:service.replacement')}
                                </Text>
                              </View>
                              {(inv as any).isCustom && (
                                <TouchableOpacity
                                  style={styles.deleteCardBtn}
                                  onPress={() => deleteIntervalMutation.mutate(inv.id)}
                                >
                                  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
                                  </Svg>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                          {(inv as any).description && <Text style={styles.intervalDesc}>{(inv as any).description}</Text>}
                          <View style={styles.intervalSpecs}>
                            {(inv as any).intervalMileage && (
                              <View style={styles.intervalSpecItem}>
                                <Text style={styles.intervalSpecText}>
                                  {t('maintenance:service.every_mileage', { mileage: ((inv as any).intervalMileage as number).toLocaleString(), unit: vehicle.mileageUnit, defaultValue: `Every ${((inv as any).intervalMileage as number).toLocaleString()} ${vehicle.mileageUnit}` })}
                                </Text>
                              </View>
                            )}
                            {(inv as any).intervalMonths && (
                              <View style={styles.intervalSpecItem}>
                                <Text style={styles.intervalSpecText}>
                                  {t('maintenance:service.every_months', { months: (inv as any).intervalMonths, defaultValue: `Every ${(inv as any).intervalMonths} mo` })}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('maintenance:service.no_intervals')}</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'SPECS' && (
                  <View style={styles.tabContentContainer}>
                    <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('maintenance:tabs.specs')}</Text>
                    <View style={styles.specsTable}>
                      <View style={styles.specsRow}>
                        <Text style={styles.specsLabel}>{t('maintenance:specs.brand')}</Text>
                        <Text style={styles.specsValue}>{vehicle.brandName}</Text>
                      </View>
                      <View style={styles.specsRow}>
                        <Text style={styles.specsLabel}>{t('maintenance:specs.model')}</Text>
                        <Text style={styles.specsValue}>{vehicle.modelName}</Text>
                      </View>
                      <View style={styles.specsRow}>
                        <Text style={styles.specsLabel}>{t('maintenance:specs.year')}</Text>
                        <Text style={styles.specsValue}>{vehicle.year}</Text>
                      </View>
                      {(vehicle as any).trimConfiguration && (
                        <View style={styles.specsRow}>
                          <Text style={styles.specsLabel}>{t('maintenance:specs.trim')}</Text>
                          <Text style={styles.specsValue}>{(vehicle as any).trimConfiguration}</Text>
                        </View>
                      )}
                      {vehicle.fuelType && (
                        <View style={styles.specsRow}>
                          <Text style={styles.specsLabel}>{t('garage:vehicle.powertrain')}</Text>
                          <Text style={styles.specsValue}>{vehicle.fuelType}</Text>
                        </View>
                      )}
                      {vehicle.transmission && (
                        <View style={styles.specsRow}>
                          <Text style={styles.specsLabel}>Transmission</Text>
                          <Text style={styles.specsValue}>{vehicle.transmission}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Sub Modals */}
      {showAddComponent && (
        <AddComponentModal
          vehicleId={vehicleId}
          visible={showAddComponent}
          onClose={() => setShowAddComponent(false)}
        />
      )}

      {showAddDocument && (
        <AddDocumentModal
          vehicleId={vehicleId}
          visible={showAddDocument}
          onClose={() => setShowAddDocument(false)}
        />
      )}

      {showAddInterval && (
        <AddIntervalModal
          vehicleId={vehicleId}
          visible={showAddInterval}
          onClose={() => setShowAddInterval(false)}
        />
      )}

      {selectedCompForDate && (
        <RecordReplacementModal
          vehicleId={vehicleId}
          component={selectedCompForDate}
          visible={!!selectedCompForDate}
          onClose={() => setSelectedCompForDate(null)}
        />
      )}
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
    backgroundColor: '#0B0D11',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  headerNickname: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#181D2A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  metaBadge: {
    backgroundColor: '#181D2A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaBadgeText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabButtonText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContentContainer: {
    paddingVertical: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  componentCard: {
    backgroundColor: '#131722',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  componentCategory: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  healthText: {
    fontSize: 11,
    fontWeight: '700',
  },
  healthBarBg: {
    height: 5,
    backgroundColor: '#181D2A',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  componentMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  componentMetaItem: {
    width: '46%',
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  setReplacementDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  setReplacementDateBtnHighlight: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  setReplacementDateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  setReplacementDateBtnTextHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#131722',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    gap: 12,
  },
  documentIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  documentNotes: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  viewDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDocText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  intervalCard: {
    backgroundColor: '#131722',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  intervalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  intervalBadge: {
    backgroundColor: '#181D2A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intervalBadgeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  intervalDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  intervalSpecs: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalSpecItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  intervalSpecText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  specsTable: {
    backgroundColor: '#131722',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  specsLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  specsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addInlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  deleteCardBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  dangerBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  dangerBannerSub: {
    fontSize: 11,
    color: '#FCA5A5',
    marginTop: 2,
  },
  unknownHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  unknownHintText: {
    flex: 1,
    fontSize: 11,
    color: '#93C5FD',
  },
  lifespanRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  lifespanBadge: {
    backgroundColor: '#181D2A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  lifespanBadgeText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

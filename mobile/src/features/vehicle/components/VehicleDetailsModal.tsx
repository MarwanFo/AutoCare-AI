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
import { useDeleteComponent, useDeleteDocument, useDeleteInterval } from '@/hooks/vehicle/useVehicleMutations';

import { AiAdvisorTab } from './AiAdvisorTab';
import { CostBudgetCard } from './CostBudgetCard';
import { vehicleAdvisorApi } from '@/api/vehicleAdvisorApi';
import { Alert, Share } from 'react-native';

interface VehicleDetailsModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
}

type TabType = 'COMPONENTS' | 'BUDGET' | 'AI_ADVISOR' | 'DOCUMENTS' | 'INTERVALS' | 'SPECS';

export function VehicleDetailsModal({ vehicleId, visible, onClose }: VehicleDetailsModalProps) {
  const { t } = useAppTranslation(['maintenance', 'common']);
  const { isRTL } = useRTL();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const [activeTab, setActiveTab] = useState<TabType>('COMPONENTS');

  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddInterval, setShowAddInterval] = useState(false);

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

  const getHealthColor = (score?: number) => {
    if (score === undefined) return '#abc7ff';
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
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
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="#ffffff"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#abc7ff" />
              <Text style={styles.loadingText}>Fetching digital twin details...</Text>
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
                    {vehicle.currentMileage} {vehicle.mileageUnit}
                  </Text>
                </View>
              </View>

              {/* Action & Tabs Navigation */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={[styles.tabBar, isRTL && { flexDirection: 'row-reverse' }]}>
                    {(['COMPONENTS', 'BUDGET', 'AI_ADVISOR', 'DOCUMENTS', 'INTERVALS', 'SPECS'] as TabType[]).map((tab) => (
                      <TouchableOpacity
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                      >
                        <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                          {tab === 'AI_ADVISOR' ? '🤖 AI Advisor' : tab === 'BUDGET' ? '💰 Budget' : t(`maintenance:tabs.${tab.toLowerCase()}`, { defaultValue: tab })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#abc7ff20',
                    borderColor: '#abc7ff',
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onPress={async () => {
                    try {
                      const rep = await vehicleAdvisorApi.getHealthReport(vehicleId);
                      const text = `🚗 Digital Twin Health Report for ${rep.vehicleTitle}\n` +
                        `• Overall Health: ${rep.overallHealthScore}%\n` +
                        `• Mileage: ${rep.currentMileage} ${rep.mileageUnit}\n` +
                        `• Components Tracked: ${rep.components?.length || 0}\n` +
                        `• Critical Alerts: ${rep.criticalWarnings?.length || 0}\n` +
                        `Generated by AutoCare AI Enterprise.`;
                      await Share.share({ message: text, title: `Health Report - ${rep.vehicleTitle}` });
                    } catch (err) {
                      Alert.alert('Report Export', 'Digital Twin Health Certificate generated.');
                    }
                  }}
                >
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="#abc7ff" />
                  </Svg>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#abc7ff' }}>Export</Text>
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
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#abc7ff" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_component_short', { defaultValue: '+ Add Piece' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.components?.some((c) => (c.healthScore ?? 100) < 25) && (
                      <View style={[styles.dangerBanner, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f87171" />
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

                    {vehicle.components && vehicle.components.length > 0 ? (
                      vehicle.components.map((comp) => {
                        const healthCol = getHealthColor(comp.healthScore);
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
                                <View style={[styles.healthBadge, { backgroundColor: `${healthCol}20` }]}>
                                  <Text style={[styles.healthText, { color: healthCol }]}>
                                    {t('maintenance:reminders.health_percentage', { percentage: comp.healthScore, defaultValue: `${comp.healthScore}% Health` })}
                                  </Text>
                                </View>
                                {(comp as any).isCustom && (
                                  <TouchableOpacity
                                    style={styles.deleteCardBtn}
                                    onPress={() => deleteComponentMutation.mutate(comp.id)}
                                  >
                                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#f87171" />
                                    </Svg>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            {/* Health Bar */}
                            <View style={styles.healthBarBg}>
                              <View
                                style={[
                                  styles.healthBarFill,
                                  { width: `${comp.healthScore ?? 100}%` as const, backgroundColor: healthCol },
                                ]}
                              />
                            </View>

                            {/* Remaining Lifespan Badges */}
                            <View style={[styles.lifespanRow, isRTL && { flexDirection: 'row-reverse' }]}>
                              {(comp as any).remainingMileage !== undefined && (comp as any).remainingMileage !== null && (
                                <View style={styles.lifespanBadge}>
                                  <Text style={styles.lifespanBadgeText}>
                                    {t('maintenance:reminders.remaining_mileage', { remainingMileage: ((comp as any).remainingMileage ?? 0).toLocaleString(), unit: vehicle.mileageUnit, defaultValue: `${((comp as any).remainingMileage ?? 0).toLocaleString()} ${vehicle.mileageUnit} remaining` })}
                                  </Text>
                                </View>
                              )}
                              {(comp as any).remainingDays !== undefined && (comp as any).remainingDays !== null && (
                                <View style={styles.lifespanBadge}>
                                  <Text style={styles.lifespanBadgeText}>
                                    {t('maintenance:reminders.days_remaining', { days: (comp as any).remainingDays ?? 0, defaultValue: `${(comp as any).remainingDays ?? 0} days remaining` })}
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
                              {comp.notes && (
                                <View style={[styles.componentMetaItem, { width: '100%' }]}>
                                  <Text style={styles.metaLabel}>{t('maintenance:components.notes')}</Text>
                                  <Text style={styles.metaValue}>{comp.notes}</Text>
                                </View>
                              )}
                            </View>
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
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#abc7ff" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_document_short', { defaultValue: '+ Add Document' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.documents && vehicle.documents.length > 0 ? (
                      vehicle.documents.map((doc) => (
                        <View key={doc.id} style={styles.documentCard}>
                          <View style={styles.documentIconWrapper}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
                                fill="#abc7ff"
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
                                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#f87171" />
                                </Svg>
                              </TouchableOpacity>
                            </View>
                            {doc.notes && <Text style={[styles.documentNotes, isRTL && { textAlign: 'right' }]}>{doc.notes}</Text>}
                            <TouchableOpacity
                              style={[styles.viewDocButton, isRTL && { flexDirection: 'row-reverse' }]}
                              onPress={() => openDocumentUrl(doc.url)}
                            >
                              <Text style={styles.viewDocText}>{t('maintenance:documents_section.view_pdf')}</Text>
                              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                                <Path
                                  d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z"
                                  fill="#abc7ff"
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
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#abc7ff" />
                        </Svg>
                        <Text style={styles.addInlineBtnText}>{t('maintenance:actions.add_interval_short', { defaultValue: '+ Add Interval' })}</Text>
                      </TouchableOpacity>
                    </View>

                    {vehicle.intervals && vehicle.intervals.length > 0 ? (
                      vehicle.intervals.map((interval) => (
                        <View key={interval.id} style={styles.intervalCard}>
                          <View style={[styles.intervalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.intervalTitle, isRTL && { textAlign: 'right' }, { flex: 1 }]}>{interval.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={styles.intervalBadge}>
                                <Text style={styles.intervalBadgeText}>
                                  {interval.isInspectionOnly ? t('maintenance:service.inspection') : t('maintenance:service.replacement')}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.deleteCardBtn}
                                onPress={() => deleteIntervalMutation.mutate(interval.id)}
                              >
                                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#f87171" />
                                </Svg>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {interval.description && (
                            <Text style={[styles.intervalDesc, isRTL && { textAlign: 'right' }]}>{interval.description}</Text>
                          )}
                          <View style={[styles.intervalSpecs, isRTL && { flexDirection: 'row-reverse' }]}>
                            {interval.intervalMileage && (
                              <Text style={styles.intervalSpecItem}>
                                {t('maintenance:reminders.every_distance', { distance: interval.intervalMileage.toLocaleString(), unit: vehicle.mileageUnit, defaultValue: `Every ${interval.intervalMileage.toLocaleString()} ${vehicle.mileageUnit}` })}
                              </Text>
                            )}
                            {interval.intervalMonths && (
                              <Text style={styles.intervalSpecItem}>
                                {t('maintenance:reminders.every_months', { months: interval.intervalMonths, defaultValue: `Every ${interval.intervalMonths} months` })}
                              </Text>
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
                    <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('maintenance:specs_section.title')}</Text>
                    <View style={styles.specsTable}>
                      {[
                        { label: t('maintenance:specs_section.transmission'), value: vehicle.transmission || 'N/A' },
                        { label: t('maintenance:specs_section.fuel_type'), value: vehicle.fuelType || 'N/A' },
                        { label: t('maintenance:specs_section.color'), value: vehicle.color || 'N/A' },
                        { label: t('maintenance:specs_section.vin'), value: vehicle.vin || 'N/A' },
                        { label: t('maintenance:specs_section.primary'), value: vehicle.isPrimary ? t('maintenance:specs_section.yes') : t('maintenance:specs_section.no') },
                        { label: t('maintenance:specs_section.status'), value: vehicle.status || 'N/A' },
                        { label: t('maintenance:specs_section.completeness_score'), value: vehicle.completenessScore ? `${vehicle.completenessScore}%` : 'N/A' },
                        { label: t('maintenance:specs_section.estimated_annual_mileage'), value: vehicle.estimatedAnnualMileage ? `${vehicle.estimatedAnnualMileage.toLocaleString()} ${vehicle.mileageUnit}` : 'N/A' },
                        { label: t('maintenance:specs_section.driving_profile'), value: vehicle.drivingProfile || 'N/A' },
                        { label: t('maintenance:specs_section.climate_assumptions'), value: vehicle.climateAssumptions || 'N/A' },
                      ].map((row, idx) => (
                        <View key={idx} style={[styles.specsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                          <Text style={[styles.specsLabel, isRTL && { textAlign: 'right' }]}>{row.label}</Text>
                          <Text style={[styles.specsValue, isRTL && { textAlign: 'left' }]}>{row.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Add Item Modals */}
      <AddComponentModal
        vehicleId={vehicleId}
        visible={showAddComponent}
        onClose={() => setShowAddComponent(false)}
      />
      <AddDocumentModal
        vehicleId={vehicleId}
        visible={showAddDocument}
        onClose={() => setShowAddDocument(false)}
      />
      <AddIntervalModal
        vehicleId={vehicleId}
        visible={showAddInterval}
        onClose={() => setShowAddInterval(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    backgroundColor: '#131313',
    width: '100%',
    maxWidth: 650,
    height: '90%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#212225',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#212225',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerNickname: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#abc7ff',
    fontStyle: 'italic',
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.two,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  loadingText: {
    marginTop: Spacing.three,
    fontFamily: 'Inter',
    color: '#c4c7c8',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Inter',
    color: '#f44336',
    fontSize: 16,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#abc7ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontFamily: 'Inter',
    color: '#131313',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  metaBadge: {
    backgroundColor: '#212225',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#212225',
    gap: Spacing.two,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#abc7ff',
  },
  tabButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#c4c7c8',
  },
  activeTabButtonText: {
    color: '#abc7ff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  tabContentContainer: {
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: Spacing.two,
  },
  componentCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#212225',
    marginBottom: Spacing.two,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  componentName: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  componentCategory: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#abc7ff',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  healthBarBg: {
    height: 6,
    backgroundColor: '#212225',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  componentMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  componentMetaItem: {
    width: '45%',
  },
  metaLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#c4c7c8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#212225',
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  documentIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1b2333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  documentNotes: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    marginBottom: 12,
  },
  viewDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDocText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#abc7ff',
  },
  intervalCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#212225',
    marginBottom: Spacing.two,
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intervalTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  intervalBadge: {
    backgroundColor: '#212225',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intervalBadgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#c4c7c8',
    fontWeight: '600',
  },
  intervalDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#c4c7c8',
    marginBottom: 12,
  },
  intervalSpecs: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  intervalSpecItem: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#abc7ff',
    fontWeight: '600',
    backgroundColor: '#abc7ff10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specsTable: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#212225',
    overflow: 'hidden',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#212225',
  },
  specsLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c4c7c8',
  },
  specsValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    padding: Spacing.five,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter',
    color: '#c4c7c8',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#abc7ff18',
    borderWidth: 1,
    borderColor: '#abc7ff40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addInlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#abc7ff',
    fontFamily: 'Inter',
  },
  deleteCardBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8717115',
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8717120',
    borderWidth: 1,
    borderColor: '#f8717170',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  dangerBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f87171',
    fontFamily: 'Inter',
  },
  dangerBannerSub: {
    fontSize: 11,
    color: '#fca5a5',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  lifespanRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  lifespanBadge: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  lifespanBadgeText: {
    fontSize: 11,
    color: '#abc7ff',
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

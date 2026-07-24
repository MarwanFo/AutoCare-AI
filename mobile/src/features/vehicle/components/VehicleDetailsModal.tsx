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

interface VehicleDetailsModalProps {
  vehicleId: string;
  visible: boolean;
  onClose: () => void;
}

type TabType = 'COMPONENTS' | 'DOCUMENTS' | 'INTERVALS' | 'SPECS';

export function VehicleDetailsModal({ vehicleId, visible, onClose }: VehicleDetailsModalProps) {
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const [activeTab, setActiveTab] = useState<TabType>('COMPONENTS');

  const openDocumentUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL", err));
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
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {vehicle.purchaseCondition === 'BRAND_NEW' ? 'Brand New' : 'Used'}
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

              {/* Tabs Navigation */}
              <View style={styles.tabBar}>
                {(['COMPONENTS', 'DOCUMENTS', 'INTERVALS', 'SPECS'] as TabType[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                      {tab === 'COMPONENTS' ? 'Pieces' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Content */}
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {activeTab === 'COMPONENTS' && (
                  <View style={styles.tabContentContainer}>
                    <Text style={styles.sectionTitle}>Digital Twin Component Health</Text>
                    {vehicle.components && vehicle.components.length > 0 ? (
                      vehicle.components.map((comp) => {
                        const healthCol = getHealthColor(comp.healthScore);
                        return (
                          <View key={comp.id} style={styles.componentCard}>
                            <View style={styles.componentHeader}>
                              <View>
                                <Text style={styles.componentName}>{comp.name}</Text>
                                <Text style={styles.componentCategory}>{comp.category}</Text>
                              </View>
                              <View style={[styles.healthBadge, { backgroundColor: `${healthCol}20` }]}>
                                <Text style={[styles.healthText, { color: healthCol }]}>
                                  {comp.healthScore}% Health
                                </Text>
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

                            <View style={styles.componentMetaGrid}>
                              {comp.partNumber && (
                                <View style={styles.componentMetaItem}>
                                  <Text style={styles.metaLabel}>OEM Part Number</Text>
                                  <Text style={styles.metaValue}>{comp.partNumber}</Text>
                                </View>
                              )}
                              {comp.specifications && (
                                <View style={styles.componentMetaItem}>
                                  <Text style={styles.metaLabel}>Specifications</Text>
                                  <Text style={styles.metaValue}>{comp.specifications}</Text>
                                </View>
                              )}
                              {comp.notes && (
                                <View style={[styles.componentMetaItem, { width: '100%' }]}>
                                  <Text style={styles.metaLabel}>Notes</Text>
                                  <Text style={styles.metaValue}>{comp.notes}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No components registered for this vehicle.</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'DOCUMENTS' && (
                  <View style={styles.tabContentContainer}>
                    <Text style={styles.sectionTitle}>AI Generated Documents</Text>
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
                            <Text style={styles.documentTitle}>{doc.title}</Text>
                            {doc.notes && <Text style={styles.documentNotes}>{doc.notes}</Text>}
                            <TouchableOpacity
                              style={styles.viewDocButton}
                              onPress={() => openDocumentUrl(doc.url)}
                            >
                              <Text style={styles.viewDocText}>View PDF Document</Text>
                              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
                        <Text style={styles.emptyText}>No documents generated for this vehicle.</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'INTERVALS' && (
                  <View style={styles.tabContentContainer}>
                    <Text style={styles.sectionTitle}>Maintenance Schedule Intervals</Text>
                    {vehicle.intervals && vehicle.intervals.length > 0 ? (
                      vehicle.intervals.map((interval) => (
                        <View key={interval.id} style={styles.intervalCard}>
                          <View style={styles.intervalHeader}>
                            <Text style={styles.intervalTitle}>{interval.title}</Text>
                            <View style={styles.intervalBadge}>
                              <Text style={styles.intervalBadgeText}>
                                {interval.isInspectionOnly ? 'Inspection' : 'Replacement'}
                              </Text>
                            </View>
                          </View>
                          {interval.description && (
                            <Text style={styles.intervalDesc}>{interval.description}</Text>
                          )}
                          <View style={styles.intervalSpecs}>
                            {interval.intervalMileage && (
                              <Text style={styles.intervalSpecItem}>
                                Every {interval.intervalMileage.toLocaleString()} {vehicle.mileageUnit}
                              </Text>
                            )}
                            {interval.intervalMonths && (
                              <Text style={styles.intervalSpecItem}>
                                Every {interval.intervalMonths} months
                              </Text>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No scheduled intervals available.</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'SPECS' && (
                  <View style={styles.tabContentContainer}>
                    <Text style={styles.sectionTitle}>Full Vehicle Specifications</Text>
                    <View style={styles.specsTable}>
                      {[
                        { label: 'Transmission', value: vehicle.transmission || 'N/A' },
                        { label: 'Fuel Type', value: vehicle.fuelType || 'N/A' },
                        { label: 'Color', value: vehicle.color || 'N/A' },
                        { label: 'VIN', value: vehicle.vin || 'N/A' },
                        { label: 'Primary', value: vehicle.isPrimary ? 'Yes' : 'No' },
                        { label: 'Status', value: vehicle.status || 'N/A' },
                        { label: 'Completeness Score', value: vehicle.completenessScore ? `${vehicle.completenessScore}%` : 'N/A' },
                        { label: 'Estimated Annual Mileage', value: vehicle.estimatedAnnualMileage ? `${vehicle.estimatedAnnualMileage.toLocaleString()} ${vehicle.mileageUnit}` : 'N/A' },
                        { label: 'Driving Profile', value: vehicle.drivingProfile || 'N/A' },
                        { label: 'Climate Assumptions', value: vehicle.climateAssumptions || 'N/A' },
                      ].map((row, idx) => (
                        <View key={idx} style={styles.specsRow}>
                          <Text style={styles.specsLabel}>{row.label}</Text>
                          <Text style={styles.specsValue}>{row.value}</Text>
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
});

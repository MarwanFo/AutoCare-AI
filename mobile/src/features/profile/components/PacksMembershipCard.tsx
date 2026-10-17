import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useActivePacks } from '@/hooks/pack/usePacks';
import { PricingPack, PackType } from '@/types/pack';
import { useAppTheme } from '@/theme/ThemeProvider';
import { useLanguage } from '@/i18n/hooks/useLanguage';

interface PacksMembershipCardProps {
  onPlanSelected?: (pack: PricingPack) => void;
}

export function PacksMembershipCard({ onPlanSelected }: PacksMembershipCardProps) {
  const { isDark, colors } = useAppTheme();
  const { isRTL } = useLanguage();
  const [selectedType, setSelectedType] = useState<PackType>('SUBSCRIPTION');

  const { data: packs = [], isLoading, isError, refetch } = useActivePacks();

  const filteredPacks = packs.filter((p) => p.packType === selectedType);

  const handleSelectPack = (pack: PricingPack) => {
    const isSub = pack.packType === 'SUBSCRIPTION';
    const priceLabel = pack.price === 0 ? 'Gratuit (0 DH)' : `${pack.price} ${pack.currency === 'MAD' ? 'DH' : pack.currency}`;

    Alert.alert(
      isSub ? `Forfait ${pack.name}` : `Pack ${pack.name}`,
      `Prix: ${priceLabel}${isSub ? ' / mois' : ''}\n` +
      (pack.vehicleLimit > 0 ? `• Véhicules: Jusqu'à ${pack.vehicleLimit} voiture(s)\n` : '') +
      `• Crédits IA: ${pack.aiCredits} crédits diagnostic\n\n` +
      `Souhaitez-vous activer cette formule ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => {
            onPlanSelected?.(pack);
            Alert.alert(
              'Félicitations ! 🚗✨',
              `Votre sélection "${pack.name}" a été enregistrée avec succès.`
            );
          },
        },
      ]
    );
  };

  const parseFeatures = (features: string | string[]): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return features.split('\n').filter(Boolean);
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingBox, !isDark && styles.loadingBoxLight]}>
        <ActivityIndicator size="small" color="#EF4444" />
        <Text style={[styles.loadingText, !isDark && styles.loadingTextLight]}>
          Chargement des formules disponibles...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.errorBox, !isDark && styles.errorBoxLight]}>
        <Text style={[styles.errorTitle, !isDark && styles.errorTitleLight]}>
          Impossible de charger les forfaits
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented Type Controller */}
      <View style={[styles.segmentContainer, !isDark && styles.segmentContainerLight]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            selectedType === 'SUBSCRIPTION' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
          ]}
          onPress={() => setSelectedType('SUBSCRIPTION')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              !isDark && styles.segmentTextLight,
              selectedType === 'SUBSCRIPTION' && styles.segmentTextActive,
            ]}
          >
            🚗 Abonnements Mensuels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            selectedType === 'CREDIT_PACK' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
          ]}
          onPress={() => setSelectedType('CREDIT_PACK')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              !isDark && styles.segmentTextLight,
              selectedType === 'CREDIT_PACK' && styles.segmentTextActive,
            ]}
          >
            ⚡ Recharges Crédits IA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Packs List */}
      <View style={styles.cardsList}>
        {filteredPacks.length === 0 ? (
          <View style={[styles.emptyBox, !isDark && styles.emptyBoxLight]}>
            <Text style={[styles.emptyText, !isDark && styles.emptyTextLight]}>
              Aucun forfait disponible pour le moment.
            </Text>
          </View>
        ) : (
          filteredPacks.map((pack) => {
            const isSub = pack.packType === 'SUBSCRIPTION';
            const features = parseFeatures(pack.features);
            const isPopular = pack.badge?.toLowerCase().includes('popular') || pack.badge?.toLowerCase().includes('best');

            return (
              <View
                key={pack.id}
                style={[
                  styles.packCard,
                  !isDark && styles.packCardLight,
                  isPopular && styles.packCardPopular,
                ]}
              >
                {/* Glow Effect */}
                <View style={[styles.cardGlow, !isDark && styles.cardGlowLight]} pointerEvents="none" />

                {/* Top Header Row with Badge */}
                <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.packName, !isDark && styles.packNameLight, isRTL && styles.textRight]}>
                      {pack.name}
                    </Text>
                    {pack.description ? (
                      <Text style={[styles.packDescription, !isDark && styles.packDescriptionLight, isRTL && styles.textRight]}>
                        {pack.description}
                      </Text>
                    ) : null}
                  </View>

                  {pack.badge ? (
                    <View
                      style={[
                        styles.badgeTag,
                        isPopular ? styles.badgeTagPopular : styles.badgeTagNeutral,
                      ]}
                    >
                      <Text style={styles.badgeTagText}>{pack.badge}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Price Display */}
                <View style={[styles.priceRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.priceAmount, !isDark && styles.priceAmountLight]}>
                    {pack.price === 0 ? '0 DH' : `${pack.price} ${pack.currency === 'MAD' ? 'DH' : pack.currency}`}
                  </Text>
                  {isSub && (
                    <Text style={[styles.pricePeriod, !isDark && styles.pricePeriodLight]}>
                      / mois
                    </Text>
                  )}
                </View>

                {/* Quotas Specs Row */}
                <View style={[styles.quotasRow, !isDark && styles.quotasRowLight]}>
                  <View style={styles.quotaItem}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"
                        fill="#3B82F6"
                      />
                    </Svg>
                    <Text style={[styles.quotaValue, !isDark && styles.quotaValueLight]}>
                      {pack.vehicleLimit === -1 ? 'Véhicules illimités' : pack.vehicleLimit === 0 ? 'Tous vos véhicules' : `${pack.vehicleLimit} Véhicule${pack.vehicleLimit > 1 ? 's' : ''}`}
                    </Text>
                  </View>

                  <View style={[styles.quotaDivider, !isDark && styles.quotaDividerLight]} />

                  <View style={styles.quotaItem}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="#F59E0B"
                      />
                    </Svg>
                    <Text style={[styles.quotaValue, !isDark && styles.quotaValueLight]}>
                      {pack.aiCredits} Crédits IA
                    </Text>
                  </View>
                </View>

                {/* Features Checklist */}
                {features.length > 0 && (
                  <View style={styles.featuresList}>
                    {features.map((feat, idx) => (
                      <View key={idx} style={[styles.featureItem, isRTL && styles.rowReverse]}>
                        <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            fill="#10B981"
                          />
                        </Svg>
                        <Text style={[styles.featureText, !isDark && styles.featureTextLight]}>
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action CTA Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isPopular ? styles.actionBtnPopular : styles.actionBtnDefault,
                  ]}
                  onPress={() => handleSelectPack(pack)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>
                    {pack.price === 0 ? 'Choisir l\'offre Gratuite' : isSub ? 'Souscrire au Forfait' : 'Acheter le Pack'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#141824',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentContainerLight: {
    backgroundColor: '#E2E8F0',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActiveDark: {
    backgroundColor: '#1E2538',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  segmentTextLight: {
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },
  cardsList: {
    gap: 16,
  },
  packCard: {
    backgroundColor: '#141824',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  packCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  packCardPopular: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1.5,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EF4444',
    opacity: 0.06,
  },
  cardGlowLight: {
    opacity: 0.03,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  packName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  packNameLight: {
    color: '#0F172A',
  },
  packDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  packDescriptionLight: {
    color: '#64748B',
  },
  badgeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTagPopular: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgeTagNeutral: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 14,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  priceAmountLight: {
    color: '#0F172A',
  },
  pricePeriod: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  pricePeriodLight: {
    color: '#64748B',
  },
  quotasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E121D',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  quotasRowLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  quotaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  quotaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  quotaValueLight: {
    color: '#334155',
  },
  quotaDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  quotaDividerLight: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },
  featuresList: {
    gap: 8,
    marginBottom: 18,
    paddingTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  featureTextLight: {
    color: '#475569',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPopular: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnDefault: {
    backgroundColor: '#1E2538',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141824',
    borderRadius: 18,
    gap: 12,
  },
  loadingBoxLight: {
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  loadingTextLight: {
    color: '#64748B',
  },
  errorBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141824',
    borderRadius: 18,
    gap: 12,
  },
  errorBoxLight: {
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  errorTitleLight: {
    color: '#DC2626',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141824',
    borderRadius: 18,
  },
  emptyBoxLight: {
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyTextLight: {
    color: '#64748B',
  },
});

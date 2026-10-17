import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useActivePacks, useUserMembershipStatus, useActivatePack } from '@/hooks/pack/usePacks';
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
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedCheckoutPack, setSelectedCheckoutPack] = useState<PricingPack | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const { data: packs = [], isLoading: isLoadingPacks, refetch: refetchPacks } = useActivePacks();
  const { data: membershipStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useUserMembershipStatus();
  const activatePackMutation = useActivatePack();

  const filteredPacks = packs.filter((p) => p.packType === selectedType);

  const handleOpenCheckout = (pack: PricingPack) => {
    setSelectedCheckoutPack(pack);
  };

  const handleConfirmPurchase = () => {
    if (!selectedCheckoutPack) return;

    activatePackMutation.mutate(selectedCheckoutPack.id, {
      onSuccess: () => {
        setIsSuccessModalVisible(true);
        refetchStatus();
        refetchPacks();
        onPlanSelected?.(selectedCheckoutPack);
      },
      onError: (err: any) => {
        Alert.alert(
          'Erreur d\'activation',
          err?.response?.data?.message || 'Une erreur est survenue lors de l\'activation. Veuillez réessayer.'
        );
      },
    });
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

  const FAQS = [
    {
      q: 'Puis-je changer ou annuler ma formule à tout moment ?',
      a: 'Oui, absolument. Vous pouvez monter en gamme ou résilier sans engagement directement depuis votre profil. Les changements de quotas prennent effet immédiatement.',
    },
    {
      q: 'Les crédits de diagnostic IA expirent-ils ?',
      a: 'Les recharges ponctuelles de crédits IA n\'expirent jamais et restent sur votre compte jusqu\'à utilisation. Pour les forfaits mensuels, vos crédits se renouvellent chaque mois.',
    },
    {
      q: 'Quels modes de paiement sont pris en charge au Maroc ?',
      a: 'Nous acceptons toutes les cartes bancaires marocaines (CMI, Attijariwafa, BCP, BMCE, etc.), les cartes Visa / Mastercard internationales, ainsi qu\'Apple Pay.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. HERO CARD: LIVE SUBSCRIPTION & CREDITS BALANCE */}
      <View style={[styles.statusHeroCard, !isDark && styles.statusHeroCardLight]}>
        <View style={[styles.heroGlow, !isDark && styles.heroGlowLight]} pointerEvents="none" />

        <View style={[styles.heroHeaderRow, isRTL && styles.rowReverse]}>
          <View>
            <View style={styles.planBadgeContainer}>
              <View style={styles.planStatusDot} />
              <Text style={styles.planBadgeText}>
                {membershipStatus?.currentPack?.name
                  ? `Formule Active : ${membershipStatus.currentPack.name}`
                  : 'Formule Active : Starter Driver'}
              </Text>
            </View>
            <Text style={[styles.heroTitle, !isDark && styles.heroTitleLight, isRTL && styles.textRight]}>
              AutoCare Membership
            </Text>
          </View>

          <View style={[styles.vipShieldBadge, !isDark && styles.vipShieldBadgeLight]}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                fill="#EF4444"
              />
            </Svg>
          </View>
        </View>

        {/* Live Gauges Row */}
        <View style={[styles.gaugesContainer, !isDark && styles.gaugesContainerLight]}>
          {/* AI Credits Gauge */}
          <View style={styles.gaugeItem}>
            <View style={styles.gaugeHeader}>
              <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#F59E0B"
                />
              </Svg>
              <Text style={[styles.gaugeLabel, !isDark && styles.gaugeLabelLight]}>Solde Crédits IA</Text>
            </View>
            <View style={styles.gaugeValueRow}>
              <Text style={[styles.gaugeValueBig, { color: '#F59E0B' }]}>
                {isLoadingStatus ? '...' : (membershipStatus?.aiCredits ?? 10)}
              </Text>
              <Text style={[styles.gaugeUnit, !isDark && styles.gaugeUnitLight]}>tokens</Text>
            </View>
            <Text style={[styles.gaugeSub, !isDark && styles.gaugeSubLight]}>
              Disponibles pour diagnostics
            </Text>
          </View>

          <View style={[styles.gaugeDivider, !isDark && styles.gaugeDividerLight]} />

          {/* Vehicles Quota Gauge */}
          <View style={styles.gaugeItem}>
            <View style={styles.gaugeHeader}>
              <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"
                  fill="#3B82F6"
                />
              </Svg>
              <Text style={[styles.gaugeLabel, !isDark && styles.gaugeLabelLight]}>Flotte Véhicules</Text>
            </View>
            <View style={styles.gaugeValueRow}>
              <Text style={[styles.gaugeValueBig, { color: '#3B82F6' }]}>
                {isLoadingStatus ? '...' : (membershipStatus?.vehiclesCount ?? 0)}
              </Text>
              <Text style={[styles.gaugeUnit, !isDark && styles.gaugeUnitLight]}>
                / {membershipStatus?.vehicleLimit === -1 ? '∞' : (membershipStatus?.vehicleLimit ?? 1)}
              </Text>
            </View>
            <Text style={[styles.gaugeSub, !isDark && styles.gaugeSubLight]}>
              {membershipStatus?.vehicleLimit === -1
                ? 'Véhicules illimités'
                : 'Places garage utilisées'}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. CATEGORY TOGGLE: Subscriptions vs Credit Boosts */}
      <View style={[styles.categoryTabsWrapper, !isDark && styles.categoryTabsWrapperLight]}>
        <TouchableOpacity
          style={[
            styles.categoryTabBtn,
            selectedType === 'SUBSCRIPTION' && (isDark ? styles.categoryTabBtnActiveDark : styles.categoryTabBtnActiveLight),
          ]}
          onPress={() => setSelectedType('SUBSCRIPTION')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.categoryTabText,
              !isDark && styles.categoryTabTextLight,
              selectedType === 'SUBSCRIPTION' && styles.categoryTabTextActive,
            ]}
          >
            🚗 Formules Conducteur
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryTabBtn,
            selectedType === 'CREDIT_PACK' && (isDark ? styles.categoryTabBtnActiveDark : styles.categoryTabBtnActiveLight),
          ]}
          onPress={() => setSelectedType('CREDIT_PACK')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.categoryTabText,
              !isDark && styles.categoryTabTextLight,
              selectedType === 'CREDIT_PACK' && styles.categoryTabTextActive,
            ]}
          >
            ⚡ Recharges Crédits IA
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. ANNUAL BILLING TOGGLE (For Subscriptions only) */}
      {selectedType === 'SUBSCRIPTION' && (
        <View style={[styles.cycleRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity
            style={[
              styles.cycleOption,
              billingCycle === 'MONTHLY' && (isDark ? styles.cycleOptionActiveDark : styles.cycleOptionActiveLight),
            ]}
            onPress={() => setBillingCycle('MONTHLY')}
          >
            <Text style={[styles.cycleText, !isDark && styles.cycleTextLight, billingCycle === 'MONTHLY' && styles.cycleTextActive]}>
              Mensuel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cycleOption,
              billingCycle === 'ANNUAL' && (isDark ? styles.cycleOptionActiveDark : styles.cycleOptionActiveLight),
            ]}
            onPress={() => setBillingCycle('ANNUAL')}
          >
            <Text style={[styles.cycleText, !isDark && styles.cycleTextLight, billingCycle === 'ANNUAL' && styles.cycleTextActive]}>
              Annuel
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-20% Offert</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. PACKS CARDS LIST */}
      {isLoadingPacks ? (
        <View style={[styles.loadingBox, !isDark && styles.loadingBoxLight]}>
          <ActivityIndicator size="small" color="#EF4444" />
          <Text style={[styles.loadingText, !isDark && styles.loadingTextLight]}>
            Actualisation des offres en direct...
          </Text>
        </View>
      ) : (
        <View style={styles.cardsStack}>
          {filteredPacks.map((pack) => {
            const isSub = pack.packType === 'SUBSCRIPTION';
            const features = parseFeatures(pack.features);
            const isPro = pack.code.includes('PRO');
            const isGarageMaster = pack.code.includes('GARAGE') || pack.code.includes('POWER');
            const isCurrentActive = membershipStatus?.currentPack?.code === pack.code;

            // Calculate annual discounted price if annual selected
            const calculatedPrice = billingCycle === 'ANNUAL' && isSub && pack.price > 0
              ? Math.round(pack.price * 12 * 0.8)
              : pack.price;

            return (
              <View
                key={pack.id}
                style={[
                  styles.cardShell,
                  !isDark && styles.cardShellLight,
                  isPro && styles.cardShellPro,
                  isGarageMaster && styles.cardShellMaster,
                ]}
              >
                {/* Visual Highlights */}
                {isPro && (
                  <View style={styles.popularRibbon}>
                    <Text style={styles.popularRibbonText}>⭐ PLUS POPULAIRE — CHOIX CONDUCTEUR</Text>
                  </View>
                )}

                {isGarageMaster && (
                  <View style={styles.vipRibbon}>
                    <Text style={styles.vipRibbonText}>💎 MULTI-VÉHICULES & FAMILLE VIP</Text>
                  </View>
                )}

                <View style={styles.cardInner}>
                  {/* Title & Tag */}
                  <View style={[styles.titleHeader, isRTL && styles.rowReverse]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tierTitle, !isDark && styles.tierTitleLight, isRTL && styles.textRight]}>
                        {pack.name}
                      </Text>
                      {pack.description ? (
                        <Text style={[styles.tierDesc, !isDark && styles.tierDescLight, isRTL && styles.textRight]}>
                          {pack.description}
                        </Text>
                      ) : null}
                    </View>

                    {pack.badge ? (
                      <View style={[styles.badgePill, isPro ? styles.badgePillPro : styles.badgePillDefault]}>
                        <Text style={styles.badgePillText}>{pack.badge}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Price Banner */}
                  <View style={[styles.priceTagRow, isRTL && styles.rowReverse]}>
                    <Text style={[styles.priceSymbol, !isDark && styles.priceSymbolLight]}>
                      {calculatedPrice === 0 ? 'Gratuit' : `${calculatedPrice}`}
                    </Text>
                    {calculatedPrice > 0 && (
                      <Text style={[styles.priceCurrency, !isDark && styles.priceCurrencyLight]}>
                        DH
                      </Text>
                    )}
                    {isSub && (
                      <Text style={[styles.priceCycle, !isDark && styles.priceCycleLight]}>
                        {billingCycle === 'ANNUAL' ? ' / an (-20%)' : ' / mois'}
                      </Text>
                    )}
                  </View>

                  {/* Highlights Metric Box */}
                  <View style={[styles.metricsBox, !isDark && styles.metricsBoxLight]}>
                    <View style={styles.metricItem}>
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"
                          fill="#3B82F6"
                        />
                      </Svg>
                      <View>
                        <Text style={[styles.metricMain, !isDark && styles.metricMainLight]}>
                          {pack.vehicleLimit === -1 ? 'Illimité' : pack.vehicleLimit === 0 ? 'Tous véhicules' : `${pack.vehicleLimit} Voiture${pack.vehicleLimit > 1 ? 's' : ''}`}
                        </Text>
                        <Text style={[styles.metricSub, !isDark && styles.metricSubLight]}>Autorisées</Text>
                      </View>
                    </View>

                    <View style={[styles.metricsDivider, !isDark && styles.metricsDividerLight]} />

                    <View style={styles.metricItem}>
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill="#F59E0B"
                        />
                      </Svg>
                      <View>
                        <Text style={[styles.metricMain, !isDark && styles.metricMainLight]}>
                          {pack.aiCredits} Crédits IA
                        </Text>
                        <Text style={[styles.metricSub, !isDark && styles.metricSubLight]}>
                          {isSub ? 'Par mois' : 'Instantanés'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Features List */}
                  <View style={styles.featureListWrap}>
                    {features.map((feat, idx) => (
                      <View key={idx} style={[styles.featureRow, isRTL && styles.rowReverse]}>
                        <View style={styles.checkCircle}>
                          <Svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF" />
                          </Svg>
                        </View>
                        <Text style={[styles.featureText, !isDark && styles.featureTextLight]}>
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.ctaButton,
                      isCurrentActive && styles.ctaButtonActive,
                      isPro && !isCurrentActive && styles.ctaButtonPro,
                      isGarageMaster && !isCurrentActive && styles.ctaButtonMaster,
                    ]}
                    disabled={isCurrentActive || activatePackMutation.isPending}
                    onPress={() => handleOpenCheckout(pack)}
                    activeOpacity={0.85}
                  >
                    {activatePackMutation.isPending && selectedCheckoutPack?.id === pack.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.ctaButtonText}>
                        {isCurrentActive
                          ? '✓ Formule Actuelle'
                          : pack.price === 0
                          ? 'Garder l\'offre Gratuite'
                          : isSub
                          ? `Passer à ${pack.name}`
                          : `Recharger (${calculatedPrice} DH)`}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 5. TRUST BADGES & PAYMENT METHODS STRIP */}
      <View style={[styles.trustStrip, !isDark && styles.trustStripLight]}>
        <View style={styles.trustItem}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
              fill="#10B981"
            />
          </Svg>
          <Text style={[styles.trustText, !isDark && styles.trustTextLight]}>
            Paiement Sécurisé CMI & 3D-Secure
          </Text>
        </View>

        <View style={styles.paymentIconsRow}>
          {['CMI Maroc', 'Visa', 'Mastercard', 'Apple Pay'].map((provider) => (
            <View key={provider} style={[styles.payBadge, !isDark && styles.payBadgeLight]}>
              <Text style={[styles.payBadgeText, !isDark && styles.payBadgeTextLight]}>{provider}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 6. FAQ ACCORDION */}
      <View style={[styles.faqSection, !isDark && styles.faqSectionLight]}>
        <Text style={[styles.faqHeading, !isDark && styles.faqHeadingLight]}>
          Questions Fréquentes
        </Text>

        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.faqItem, !isDark && styles.faqItemLight]}
                onPress={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                activeOpacity={0.8}
              >
                <View style={[styles.faqHeader, isRTL && styles.rowReverse]}>
                  <Text style={[styles.faqQuestion, !isDark && styles.faqQuestionLight, { flex: 1 }]}>
                    {faq.q}
                  </Text>
                  <Text style={[styles.faqChevron, !isDark && styles.faqChevronLight]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, !isDark && styles.faqAnswerLight]}>
                    {faq.a}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7. CHECKOUT CONFIRMATION MODAL */}
      <Modal visible={Boolean(selectedCheckoutPack)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, !isDark && styles.modalCardLight]}>
            <View style={styles.modalTopHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, !isDark && styles.modalTitleLight]}>
                Récapitulatif de Commande
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCheckoutPack(null)}
                style={styles.modalCloseCircle}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedCheckoutPack && (
              <View style={styles.modalBody}>
                {/* Plan Summary Tile */}
                <View style={[styles.summaryTile, !isDark && styles.summaryTileLight]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryName, !isDark && styles.summaryNameLight]}>
                      {selectedCheckoutPack.name}
                    </Text>
                    <Text style={[styles.summaryDesc, !isDark && styles.summaryDescLight]}>
                      {selectedCheckoutPack.packType === 'SUBSCRIPTION'
                        ? `Abonnement ${billingCycle === 'ANNUAL' ? 'Annuel (-20%)' : 'Mensuel sans engagement'}`
                        : 'Recharge de crédits instantanée (sans expiration)'}
                    </Text>
                  </View>
                  <Text style={[styles.summaryPrice, !isDark && styles.summaryPriceLight]}>
                    {selectedCheckoutPack.price === 0
                      ? '0 DH'
                      : `${billingCycle === 'ANNUAL' && selectedCheckoutPack.packType === 'SUBSCRIPTION' ? Math.round(selectedCheckoutPack.price * 12 * 0.8) : selectedCheckoutPack.price} DH`}
                  </Text>
                </View>

                {/* Inclusions Detail */}
                <View style={styles.inclusionsRow}>
                  <Text style={[styles.inclusionLabel, !isDark && styles.inclusionLabelLight]}>
                    • Quota Véhicules :
                  </Text>
                  <Text style={[styles.inclusionVal, !isDark && styles.inclusionValLight]}>
                    {selectedCheckoutPack.vehicleLimit === -1 ? 'Illimités' : `${selectedCheckoutPack.vehicleLimit} voiture(s)`}
                  </Text>
                </View>

                <View style={styles.inclusionsRow}>
                  <Text style={[styles.inclusionLabel, !isDark && styles.inclusionLabelLight]}>
                    • Crédits Diagnostic IA :
                  </Text>
                  <Text style={[styles.inclusionVal, !isDark && styles.inclusionValLight]}>
                    +{selectedCheckoutPack.aiCredits} crédits alloués
                  </Text>
                </View>

                <View style={styles.inclusionsRow}>
                  <Text style={[styles.inclusionLabel, !isDark && styles.inclusionLabelLight]}>
                    • TVA & Taxes :
                  </Text>
                  <Text style={[styles.inclusionVal, !isDark && styles.inclusionValLight]}>
                    Incluses (0 DH additionnel)
                  </Text>
                </View>

                <View style={[styles.checkoutDivider, !isDark && styles.checkoutDividerLight]} />

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, !isDark && styles.totalLabelLight]}>Total à régler</Text>
                  <Text style={styles.totalAmount}>
                    {selectedCheckoutPack.price === 0
                      ? '0 DH'
                      : `${billingCycle === 'ANNUAL' && selectedCheckoutPack.packType === 'SUBSCRIPTION' ? Math.round(selectedCheckoutPack.price * 12 * 0.8) : selectedCheckoutPack.price} DH`}
                  </Text>
                </View>

                {/* Submit Checkout Button */}
                <TouchableOpacity
                  style={styles.checkoutSubmitBtn}
                  disabled={activatePackMutation.isPending}
                  onPress={handleConfirmPurchase}
                  activeOpacity={0.85}
                >
                  {activatePackMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkoutSubmitText}>
                      Confirmer & Activer Immédiatement 🚀
                    </Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.secureDisclaimer}>
                  🔒 Transaction sécurisée. Activation immédiate de vos fonctionnalités.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 8. SUCCESS CONFIRMATION MODAL */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, !isDark && styles.successCardLight]}>
            <View style={styles.successIconCircle}>
              <Text style={{ fontSize: 36 }}>🎉</Text>
            </View>

            <Text style={[styles.successTitle, !isDark && styles.successTitleLight]}>
              Félicitations !
            </Text>
            <Text style={[styles.successSubtitle, !isDark && styles.successSubtitleLight]}>
              Votre formule a été activée avec succès. Vos crédits IA et capacités garage sont disponibles immédiatement.
            </Text>

            <TouchableOpacity
              style={styles.successDismissBtn}
              onPress={() => {
                setIsSuccessModalVisible(false);
                setSelectedCheckoutPack(null);
              }}
            >
              <Text style={styles.successDismissText}>Accéder à mon espace</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },

  // Hero Status Card
  statusHeroCard: {
    backgroundColor: '#121624',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  statusHeroCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowOpacity: 0.06,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#EF4444',
    opacity: 0.08,
  },
  heroGlowLight: {
    opacity: 0.04,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  planStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  heroTitleLight: {
    color: '#0F172A',
  },
  vipShieldBadge: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  vipShieldBadgeLight: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },

  // Gauges
  gaugesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0D16',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  gaugesContainerLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  gaugeItem: {
    flex: 1,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  gaugeLabelLight: {
    color: '#64748B',
  },
  gaugeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gaugeValueBig: {
    fontSize: 22,
    fontWeight: '900',
  },
  gaugeUnit: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  gaugeUnitLight: {
    color: '#64748B',
  },
  gaugeSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  gaugeSubLight: {
    color: '#94A3B8',
  },
  gaugeDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 14,
  },
  gaugeDividerLight: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },

  // Category Tabs
  categoryTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#141824',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryTabsWrapperLight: {
    backgroundColor: '#E2E8F0',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  categoryTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  categoryTabBtnActiveDark: {
    backgroundColor: '#1E2538',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabBtnActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryTabTextLight: {
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },

  // Billing cycle
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  cycleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cycleOptionActiveDark: {
    backgroundColor: '#1C2234',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cycleOptionActiveLight: {
    backgroundColor: '#E2E8F0',
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  cycleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cycleTextLight: {
    color: '#64748B',
  },
  cycleTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },
  discountBadge: {
    marginLeft: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Cards
  cardsStack: {
    gap: 16,
  },
  cardShell: {
    backgroundColor: '#141824',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  cardShellLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowOpacity: 0.06,
  },
  cardShellPro: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1.8,
  },
  cardShellMaster: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderWidth: 1.5,
  },
  popularRibbon: {
    backgroundColor: '#EF4444',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  vipRibbon: {
    backgroundColor: '#2563EB',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cardInner: {
    padding: 20,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  tierTitleLight: {
    color: '#0F172A',
  },
  tierDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  tierDescLight: {
    color: '#64748B',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillPro: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgePillDefault: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
  },

  // Price tag
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 16,
  },
  priceSymbol: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  priceSymbolLight: {
    color: '#0F172A',
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
  },
  priceCurrencyLight: {
    color: '#EF4444',
  },
  priceCycle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priceCycleLight: {
    color: '#64748B',
  },

  // Metrics
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0F19',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricsBoxLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricMain: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricMainLight: {
    color: '#1E293B',
  },
  metricSub: {
    fontSize: 9,
    color: '#64748B',
  },
  metricSubLight: {
    color: '#94A3B8',
  },
  metricsDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 10,
  },
  metricsDividerLight: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },

  // Features list
  featureListWrap: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  featureTextLight: {
    color: '#334155',
  },

  // CTA Button
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2538',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ctaButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
    opacity: 0.9,
  },
  ctaButtonPro: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonMaster: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Trust Strip
  trustStrip: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 10,
  },
  trustStripLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  trustTextLight: {
    color: '#059669',
  },
  paymentIconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0F131E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  payBadgeLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  payBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  payBadgeTextLight: {
    color: '#475569',
  },

  // FAQ
  faqSection: {
    backgroundColor: '#141824',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  faqSectionLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  faqHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  faqHeadingLight: {
    color: '#0F172A',
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#0E121E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  faqItemLight: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  faqQuestionLight: {
    color: '#1E293B',
  },
  faqChevron: {
    fontSize: 10,
    color: '#94A3B8',
  },
  faqChevronLight: {
    color: '#64748B',
  },
  faqAnswer: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 16,
  },
  faqAnswerLight: {
    color: '#64748B',
  },

  // Loading
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141824',
    borderRadius: 18,
    gap: 10,
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

  // Modal Checkout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#141824',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  modalTopHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalTitleLight: {
    color: '#0F172A',
  },
  modalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E2538',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  summaryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C0F1A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryTileLight: {
    backgroundColor: '#F1F5F9',
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  summaryNameLight: {
    color: '#0F172A',
  },
  summaryDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  summaryDescLight: {
    color: '#64748B',
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EF4444',
  },
  summaryPriceLight: {
    color: '#EF4444',
  },
  inclusionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  inclusionLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inclusionLabelLight: {
    color: '#64748B',
  },
  inclusionVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  inclusionValLight: {
    color: '#1E293B',
  },
  checkoutDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  checkoutDividerLight: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  totalLabelLight: {
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },
  checkoutSubmitBtn: {
    marginTop: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  checkoutSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secureDisclaimer: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },

  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#141824',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  successTitleLight: {
    color: '#0F172A',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  successSubtitleLight: {
    color: '#64748B',
  },
  successDismissBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  successDismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

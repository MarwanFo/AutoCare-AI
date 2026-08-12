import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

export default function AppTabs() {
  const { t } = useAppTranslation('common');

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>{t('common:nav_home')}</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>{t('common:nav_explore')}</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href={"/profile" as any} asChild>
            <TabButton>{t('common:nav_profile')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.brandContainer}>
          <View style={styles.logoDot} />
          <ThemedText type="smallBold" style={styles.brandText}>
            AutoCare AI
          </ThemedText>
          <View style={styles.proBadge}>
            <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
          </View>
        </View>

        <View style={styles.navGroup}>
          {props.children}
        </View>

        <ExternalLink href="https://autocare.ai/docs" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link" style={styles.docsLink}>Docs</ThemedText>
            <SymbolView
              tintColor="#abc7ff"
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  innerContainer: {
    backgroundColor: '#18181be6',
    borderColor: '#27272a80',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.three,
    maxWidth: 900,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 'auto',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#abc7ff',
  },
  brandText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  proBadge: {
    backgroundColor: '#abc7ff20',
    borderColor: '#abc7ff40',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#abc7ff',
    fontFamily: 'Inter',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  tabButtonView: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  docsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#abc7ff',
  },
});

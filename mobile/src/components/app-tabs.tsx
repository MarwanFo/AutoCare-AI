import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Image, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAppTranslation } from '@/i18n/hooks/useAppTranslation';

export default function AppTabs() {
  const { t } = useAppTranslation('common');
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#131722',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common:nav_home'),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: t('common:nav_explore'),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('common:nav_profile'),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/profile.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

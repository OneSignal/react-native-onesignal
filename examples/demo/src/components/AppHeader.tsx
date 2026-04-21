import { useNavigation } from '@react-navigation/native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppColors } from '../theme';

export default function AppHeader({ options, back }: NativeStackHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const titleNode =
    typeof options.headerTitle === 'function' ? (
      options.headerTitle({ children: options.title ?? '', tintColor: AppColors.white })
    ) : (
      <Text style={styles.title}>{options.title ?? ''}</Text>
    );

  return (
    <View style={[styles.shadowWrap, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {back ? (
            <Pressable
              onPress={navigation.goBack}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Icon name="arrow-back" size={24} color={AppColors.white} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.center}>{titleNode}</View>
        <View style={styles.side} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    backgroundColor: AppColors.osPrimary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
    zIndex: 10,
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  side: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

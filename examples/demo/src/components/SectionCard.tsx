import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../theme';

interface Props {
  title: string;
  children?: React.ReactNode;
  onInfoTap?: () => void;
  style?: object;
}

export default function SectionCard({
  title,
  children,
  onInfoTap,
  style,
}: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onInfoTap && (
          <TouchableOpacity
            onPress={onInfoTap}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.infoIcon}>ⓘ</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: AppSpacing.sectionVertical,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: AppSpacing.gap,
    paddingHorizontal: 4,
  },
  title: {
    ...AppTextStyles.bodySmall,
    fontWeight: '700',
    color: AppColors.osGrey700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoIcon: {
    fontSize: 18,
    color: AppColors.osGrey500,
  },
  card: {
    ...AppTheme.card,
  },
});

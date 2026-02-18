import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, AppTheme, Spacing } from '../theme';

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
    marginBottom: Spacing.sectionGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.cardGap,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  card: {
    ...AppTheme.card,
  },
});

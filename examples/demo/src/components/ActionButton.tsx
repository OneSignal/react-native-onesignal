import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

import { AppColors, AppSpacing } from '../theme';
import { ButtonGridContext } from './ButtonGrid';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outlined';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftAligned?: boolean;
  compact?: boolean;
}

export default function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  testID,
  icon,
  iconPosition = 'left',
  leftAligned,
  compact,
}: Props) {
  const inGrid = useContext(ButtonGridContext);
  const singleLine = compact || inGrid;
  const bgColor = variant === 'primary' ? AppColors.osPrimary : 'transparent';

  const borderStyle =
    variant === 'outlined' ? { borderWidth: 1, borderColor: AppColors.osPrimary } : {};

  const textColor = variant === 'outlined' ? AppColors.osPrimary : AppColors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.button,
        { backgroundColor: bgColor },
        borderStyle,
        singleLine && styles.compact,
        inGrid && styles.gridCell,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={[styles.inner, leftAligned && styles.leftAligned]}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[styles.text, { color: textColor }, singleLine && styles.compactText]}
            numberOfLines={singleLine ? 1 : undefined}
            adjustsFontSizeToFit={singleLine}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: AppSpacing.gap,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAligned: {
    justifyContent: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  compact: {
    paddingHorizontal: 8,
  },
  compactText: {
    flexShrink: 1,
  },
  gridCell: {
    width: 'auto',
    flexGrow: 1,
    flexBasis: '40%',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

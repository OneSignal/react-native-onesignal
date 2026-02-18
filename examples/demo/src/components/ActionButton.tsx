import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'destructive' | 'outlined';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftAligned?: boolean;
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
}: Props) {
  const bgColor =
    variant === 'primary'
      ? Colors.oneSignalRed
      : variant === 'destructive'
        ? Colors.destructiveRed
        : 'transparent';

  const borderStyle =
    variant === 'outlined'
      ? { borderWidth: 1, borderColor: Colors.oneSignalRed }
      : {};

  const textColor = variant === 'outlined' ? Colors.oneSignalRed : Colors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.button,
        { backgroundColor: bgColor },
        borderStyle,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={[styles.inner, leftAligned && styles.leftAligned]}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: Spacing.cardGap,
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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

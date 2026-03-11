import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppColors, AppSpacing } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgColor = variant === 'primary' ? AppColors.osPrimary : 'transparent';

  const borderStyle =
    variant === 'outlined' || variant === 'destructive'
      ? { borderWidth: 1, borderColor: AppColors.osPrimary }
      : {};

  const textColor =
    variant === 'outlined' || variant === 'destructive'
      ? AppColors.osPrimary
      : AppColors.white;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.button,
        { backgroundColor: bgColor },
        borderStyle,
        (disabled || loading) && styles.disabled,
        animatedStyle,
      ]}
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
    </AnimatedPressable>
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

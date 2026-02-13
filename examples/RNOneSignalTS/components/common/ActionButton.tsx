import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { CommonStyles } from '../../constants/Styles';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export function ActionButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}: ActionButtonProps) {
  const buttonStyle =
    variant === 'outline'
      ? CommonStyles.outlineButton
      : CommonStyles.primaryButton;
  const buttonTextStyle =
    variant === 'outline'
      ? CommonStyles.outlineButtonText
      : CommonStyles.primaryButtonText;

  return (
    <TouchableOpacity
      style={[buttonStyle, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { CommonStyles } from '../../constants/Styles';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ActionButton({
  title,
  onPress,
  style,
  textStyle,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[CommonStyles.primaryButton, style]}
      onPress={onPress}
    >
      <Text style={[CommonStyles.primaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { CommonStyles } from '../../constants/Styles';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[CommonStyles.card, style]}>{children}</View>;
}

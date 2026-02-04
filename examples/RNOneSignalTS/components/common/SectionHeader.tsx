import React from 'react';
import { Text, TextStyle } from 'react-native';
import { CommonStyles } from '../../constants/Styles';

interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
}

export function SectionHeader({ title, style }: SectionHeaderProps) {
  return <Text style={[CommonStyles.sectionHeader, style]}>{title}</Text>;
}

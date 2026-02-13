import React from 'react';
import { Text, TextStyle, View, StyleSheet } from 'react-native';
import { CommonStyles } from '../../constants/Styles';
import { TooltipButton } from './TooltipButton';

interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
  tooltipKey?: string;
}

export function SectionHeader({ title, style, tooltipKey }: SectionHeaderProps) {
  if (tooltipKey) {
    return (
      <View style={styles.container}>
        <Text style={[CommonStyles.sectionHeader, style]}>{title}</Text>
        <TooltipButton tooltipKey={tooltipKey} />
      </View>
    );
  }

  return <Text style={[CommonStyles.sectionHeader, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
});

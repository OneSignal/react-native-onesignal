import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { showTooltip } from '../../utils/TooltipHelper';
import { Colors } from '../../constants/Colors';

interface TooltipButtonProps {
  tooltipKey: string;
}

export function TooltipButton({ tooltipKey }: TooltipButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => showTooltip(tooltipKey)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.icon}>ℹ️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: Colors.primary,
  },
});

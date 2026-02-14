import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>i</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
    fontStyle: 'italic',
  },
});

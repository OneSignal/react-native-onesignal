import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ccc', true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.darkText,
  },
});

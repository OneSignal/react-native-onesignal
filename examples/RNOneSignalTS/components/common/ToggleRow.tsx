import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: ToggleRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
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
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: Colors.darkText,
  },
  description: {
    fontSize: 12,
    color: Colors.darkText,
    opacity: 0.7,
    marginTop: 2,
  },
});

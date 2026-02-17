import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <Text style={styles.emptyText}>{message}</Text>;
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    color: Colors.darkText,
    opacity: 0.5,
    fontSize: 14,
    paddingVertical: 16,
  },
});

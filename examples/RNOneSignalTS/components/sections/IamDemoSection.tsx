import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { IamTypes } from '../../constants/IamTemplates';
import { Colors } from '../../constants/Colors';

interface IamDemoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function IamDemoSection({ loggingFunction }: IamDemoSectionProps) {
  const handleIamDemo = (type: string, title: string) => {
    loggingFunction(`Triggering ${title} IAM demo`);
    // In a real app, this would trigger a test IAM
    // For now, just log it
  };

  return (
    <Card>
      <SectionHeader title="In-App Message Demos" />
      <View style={styles.grid}>
        {IamTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.gridItem}
            onPress={() => handleIamDemo(type.id, type.title)}
          >
            <Text style={styles.icon}>{type.icon}</Text>
            <Text style={styles.title}>{type.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: Colors.darkText,
    textAlign: 'center',
    fontWeight: '600',
  },
});

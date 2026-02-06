import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <SectionHeader title="Send In-App Message" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    marginBottom: 8,
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

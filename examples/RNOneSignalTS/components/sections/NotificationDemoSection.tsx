import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SectionHeader } from '../common/SectionHeader';
import { NotificationTypes } from '../../constants/NotificationTemplates';
import { Colors } from '../../constants/Colors';

interface NotificationDemoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function NotificationDemoSection({
  loggingFunction,
}: NotificationDemoSectionProps) {
  const handleNotificationDemo = (type: string, title: string) => {
    loggingFunction(`Triggering ${title} notification demo`);
    // In a real app, this would trigger a test notification
    // For now, just log it
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Send Push Notification" />
      <View style={styles.grid}>
        {NotificationTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.gridItem}
            onPress={() => handleNotificationDemo(type.id, type.title)}
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

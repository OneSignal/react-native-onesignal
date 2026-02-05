import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SectionHeader } from '../common/SectionHeader';
import { NotificationTypes } from '../../constants/NotificationTemplates';
import { Colors } from '../../constants/Colors';
import { sendNotification } from '../../services/NotificationSender';
import { NotificationTemplates } from '../../constants/NotificationPayloads';

interface NotificationDemoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function NotificationDemoSection({
  loggingFunction,
}: NotificationDemoSectionProps) {
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);

  const handleNotificationDemo = async (type: string, title: string) => {
    setSendingNotification(type);
    loggingFunction(`Sending ${title} notification...`);

    try {
      // Get template for this notification type
      const template = NotificationTemplates.find(t => t.id === type);
      if (!template) {
        throw new Error(`Template not found for ${type}`);
      }

      // Pick a random variation (Android uses random selection)
      const variation = template.variations[
        Math.floor(Math.random() * template.variations.length)
      ];

      // Send notification
      await sendNotification(variation);

      loggingFunction(`✓ ${title} notification sent successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggingFunction(`✗ Failed to send ${title}: ${errorMessage}`);
    } finally {
      setSendingNotification(null);
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Send Push Notification" />
      <View style={styles.grid}>
        {NotificationTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.gridItem,
              sendingNotification === type.id && styles.gridItemLoading
            ]}
            onPress={() => handleNotificationDemo(type.id, type.title)}
            disabled={sendingNotification !== null}
          >
            {sendingNotification === type.id && (
              <ActivityIndicator
                color={Colors.white}
                style={styles.loadingIndicator}
              />
            )}
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
  gridItemLoading: {
    opacity: 0.6,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { Colors } from '../../constants/Colors';
import { sendNotification } from '../../services/NotificationSender';
import { NotificationTemplates } from '../../constants/NotificationPayloads';
import { CustomNotificationDialog } from '../dialogs/CustomNotificationDialog';

interface NotificationDemoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function NotificationDemoSection({
  loggingFunction,
}: NotificationDemoSectionProps) {
  const [sendingNotification, setSendingNotification] = useState<string | null>(
    null,
  );
  const [customDialogVisible, setCustomDialogVisible] = useState(false);

  const handleSendSimple = async () => {
    setSendingNotification('SIMPLE');
    loggingFunction('Sending Simple notification...');

    try {
      // Use GENERAL template for simple notifications
      const template = NotificationTemplates.find((t) => t.id === 'GENERAL');
      if (!template) {
        throw new Error('Template not found for GENERAL');
      }

      const variation =
        template.variations[
          Math.floor(Math.random() * template.variations.length)
        ];

      await sendNotification(variation);
      loggingFunction('Simple notification sent successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      loggingFunction(`Failed to send Simple: ${errorMessage}`);
    } finally {
      setSendingNotification(null);
    }
  };

  const handleSendWithImage = async () => {
    setSendingNotification('WITH_IMAGE');
    loggingFunction('Sending With Image notification...');

    try {
      // Use BREAKING_NEWS template which has big pictures
      const template = NotificationTemplates.find(
        (t) => t.id === 'BREAKING_NEWS',
      );
      if (!template) {
        throw new Error('Template not found for BREAKING_NEWS');
      }

      const variation =
        template.variations[
          Math.floor(Math.random() * template.variations.length)
        ];

      await sendNotification(variation);
      loggingFunction('With Image notification sent successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      loggingFunction(`Failed to send With Image: ${errorMessage}`);
    } finally {
      setSendingNotification(null);
    }
  };

  const handleSendCustom = async (title: string, body: string) => {
    setSendingNotification('CUSTOM');
    loggingFunction(`Sending Custom notification: ${title}...`);

    try {
      await sendNotification({
        heading: title,
        content: body,
      });
      loggingFunction('Custom notification sent successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      loggingFunction(`Failed to send Custom: ${errorMessage}`);
    } finally {
      setSendingNotification(null);
    }
  };

  const isLoading = sendingNotification !== null;

  return (
    <Card>
      <SectionHeader title="Send Push Notification" tooltipKey="sendPushNotification" />
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Simple Notification"
          onPress={handleSendSimple}
          disabled={isLoading}
          style={styles.button}
        />
        {sendingNotification === 'SIMPLE' && (
          <ActivityIndicator
            color={Colors.white}
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Notification With Image"
          onPress={handleSendWithImage}
          disabled={isLoading}
          style={styles.button}
        />
        {sendingNotification === 'WITH_IMAGE' && (
          <ActivityIndicator
            color={Colors.white}
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Custom Notification"
          onPress={() => setCustomDialogVisible(true)}
          disabled={isLoading}
          style={styles.button}
        />
        {sendingNotification === 'CUSTOM' && (
          <ActivityIndicator
            color={Colors.white}
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <CustomNotificationDialog
        visible={customDialogVisible}
        onClose={() => setCustomDialogVisible(false)}
        onConfirm={handleSendCustom}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
});

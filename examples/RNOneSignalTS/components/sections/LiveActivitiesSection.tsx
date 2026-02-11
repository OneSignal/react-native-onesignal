import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';

interface LiveActivitiesSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
  inputValue: string;
}

export function LiveActivitiesSection({
  loggingFunction,
  inputValue,
}: LiveActivitiesSectionProps) {
  // Only show on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  const handleStartDefault = async () => {
    loggingFunction('Starting live activity');
    await OneSignal.LiveActivities.startDefault(
      inputValue,
      { title: 'Welcome!' },
      {
        message: { en: 'Hello World!' },
        intValue: 3,
        doubleValue: 3.14,
        boolValue: true,
      },
    );
    loggingFunction('Live Activity started');
  };

  const handleEnter = async () => {
    loggingFunction('Entering live activity');
    await OneSignal.LiveActivities.enter(inputValue, 'FAKE_TOKEN');
  };

  const handleExit = async () => {
    loggingFunction('Exiting live activity');
    await OneSignal.LiveActivities.exit(inputValue);
  };

  return (
    <Card>
      <SectionHeader title="Live Activities (iOS)" tooltipKey="liveActivities" />
      <ActionButton
        title="Start Default"
        onPress={handleStartDefault}
        style={styles.button}
      />
      <ActionButton
        title="Enter Activity"
        onPress={handleEnter}
        style={styles.button}
      />
      <ActionButton
        title="Exit Activity"
        onPress={handleExit}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

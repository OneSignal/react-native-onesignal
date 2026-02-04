import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ToggleRow } from '../common/ToggleRow';
import { ActionButton } from '../common/ActionButton';
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface PushSubscriptionSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function PushSubscriptionSection({
  loggingFunction,
}: PushSubscriptionSectionProps) {
  const { state, dispatch } = useAppState();
  const [subscriptionId, setSubscriptionId] = useState('');

  useEffect(() => {
    // Load initial subscription ID
    const loadSubscriptionId = async () => {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      if (id) {
        setSubscriptionId(id);
        dispatch({ type: 'SET_PUSH_SUBSCRIPTION_ID', payload: id });
      }
    };
    loadSubscriptionId();
  }, [dispatch]);

  const handleTogglePush = async (enabled: boolean) => {
    if (enabled) {
      loggingFunction('Subscribing for the push notifications');
      OneSignal.User.pushSubscription.optIn();
    } else {
      loggingFunction('Unsubscribing from the push notifications');
      OneSignal.User.pushSubscription.optOut();
    }
    dispatch({ type: 'SET_PUSH_ENABLED', payload: enabled });
  };

  const handleRequestPermission = async () => {
    loggingFunction('Requesting notification permission');
    const granted = await OneSignal.Notifications.requestPermission(false);
    loggingFunction(`Notification permission granted: ${granted}`);
  };

  return (
    <Card>
      <SectionHeader title="Push Subscription" />
      {subscriptionId ? (
        <View style={styles.row}>
          <Text style={styles.label}>Subscription ID:</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {subscriptionId}
          </Text>
        </View>
      ) : null}
      <ToggleRow
        label="Push Notifications"
        value={state.pushEnabled}
        onValueChange={handleTogglePush}
      />
      <ActionButton
        title="Prompt Permission"
        onPress={handleRequestPermission}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: Colors.darkText,
    marginTop: 4,
  },
  button: {
    marginTop: 8,
  },
});

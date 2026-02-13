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
    // Load initial subscription ID and permission status
    const loadInitialState = async () => {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      if (id) {
        setSubscriptionId(id);
        dispatch({ type: 'SET_PUSH_SUBSCRIPTION_ID', payload: id });
      }

      // Check current permission status
      const hasPermission = await OneSignal.Notifications.getPermissionAsync();
      dispatch({ type: 'SET_PERMISSION_GRANTED', payload: hasPermission });

      // Check opt-in status
      const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
      dispatch({ type: 'SET_PUSH_ENABLED', payload: optedIn });
    };
    loadInitialState();

    // Auto-request permission on mount (as per Android V2 spec)
    const requestPermissionOnMount = async () => {
      const hasPermission = await OneSignal.Notifications.getPermissionAsync();
      if (!hasPermission) {
        loggingFunction('Auto-requesting notification permission');
        const granted = await OneSignal.Notifications.requestPermission(false);
        dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted });
        loggingFunction(`Notification permission granted: ${granted}`);
      }
    };
    requestPermissionOnMount();
  }, [dispatch, loggingFunction]);

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
    dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted });
    loggingFunction(`Notification permission granted: ${granted}`);
  };

  return (
    <Card>
      <SectionHeader title="Push" tooltipKey="push" />
      {subscriptionId ? (
        <View style={styles.row}>
          <Text style={styles.label}>Push ID</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {subscriptionId}
          </Text>
        </View>
      ) : null}
      <ToggleRow
        label="Enabled"
        description="Opt in or out of push notifications"
        value={state.pushEnabled}
        onValueChange={handleTogglePush}
      />
      {/* Only show Prompt Push button when permission is NOT granted */}
      {!state.permissionGranted && (
        <ActionButton
          title="Prompt Push"
          onPress={handleRequestPermission}
          style={styles.button}
        />
      )}
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

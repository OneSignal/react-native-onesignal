import { ONESIGNAL_REST_API_KEY } from '@env';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

const ORDER_STATUSES = [
  { status: 'preparing', message: 'Your order is being prepared', estimatedTime: '15 min' },
  { status: 'on_the_way', message: 'Driver is heading your way', estimatedTime: '10 min' },
  { status: 'delivered', message: 'Order delivered!', estimatedTime: '' },
];

interface Props {
  onStart: (activityId: string, attributes: object, content: object) => void;
  onUpdate: (
    activityId: string,
    eventUpdates: Record<string, unknown>,
    apiKey: string,
  ) => Promise<void>;
  onStopUpdating: (activityId: string) => void;
  onInfoTap?: () => void;
}

export default function LiveActivitySection({
  onStart,
  onUpdate,
  onStopUpdating,
  onInfoTap,
}: Props) {
  const [activityId, setActivityId] = useState('order-1');
  const [orderNumber, setOrderNumber] = useState('ORD-1234');
  const [apiKey, setApiKey] = useState(ONESIGNAL_REST_API_KEY ?? '');
  const [statusIndex, setStatusIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  const handleStart = () => {
    setStatusIndex(0);
    onStart(
      activityId,
      { orderNumber },
      {
        status: ORDER_STATUSES[0].status,
        message: ORDER_STATUSES[0].message,
        estimatedTime: ORDER_STATUSES[0].estimatedTime,
      },
    );
  };

  const handleUpdate = async () => {
    const nextIndex = (statusIndex + 1) % ORDER_STATUSES.length;
    const next = ORDER_STATUSES[nextIndex];
    setUpdating(true);
    try {
      await onUpdate(
        activityId,
        {
          data: {
            status: next.status,
            message: next.message,
            estimatedTime: next.estimatedTime,
          },
        },
        apiKey,
      );
      setStatusIndex(nextIndex);
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus = ORDER_STATUSES[(statusIndex + 1) % ORDER_STATUSES.length];

  return (
    <SectionCard title="Live Activities" onInfoTap={onInfoTap}>
      <View style={AppTheme.card}>
        <InputRow
          label="Activity ID"
          value={activityId}
          onChangeText={setActivityId}
          testID="live_activity_id_input"
        />
        <InputRow
          label="Order #"
          value={orderNumber}
          onChangeText={setOrderNumber}
          testID="live_activity_order_number"
        />
        <InputRow
          label="REST API Key"
          value={apiKey}
          onChangeText={setApiKey}
          testID="live_activity_api_key"
          secureTextEntry
        />
      </View>
      <View style={styles.buttons}>
        <ActionButton
          label="START LIVE ACTIVITY"
          onPress={handleStart}
          disabled={!activityId.trim()}
          testID="start_live_activity_button"
        />
        <ActionButton
          label={`UPDATE → ${nextStatus.status.replace('_', ' ').toUpperCase()}`}
          onPress={handleUpdate}
          disabled={!activityId.trim() || !apiKey.trim() || updating}
          loading={updating}
          testID="update_live_activity_button"
        />
        <ActionButton
          label="STOP UPDATING LIVE ACTIVITY"
          onPress={() => onStopUpdating(activityId)}
          disabled={!activityId.trim()}
          variant="outlined"
          testID="stop_updating_live_activity_button"
        />
      </View>
    </SectionCard>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  testID,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={AppColors.osGrey500}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inputLabel: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
    minWidth: 80,
  },
  input: {
    ...AppTextStyles.bodyMedium,
    flex: 1,
    textAlign: 'right',
    color: '#212121',
    paddingVertical: 4,
    marginLeft: 8,
  },
  hint: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey500,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  buttons: {
    marginTop: AppSpacing.gap,
  },
});

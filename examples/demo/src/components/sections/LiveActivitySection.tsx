import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';

// ──────────────────────────────────────────────────────────────────────────────
// Push-to-update example payload (send via OneSignal REST API):
//
//   POST https://api.onesignal.com/apps/{app_id}/live_activities/{activity_id}/notifications
//   {
//     "event": "update",
//     "event_updates": {
//       "status": "on_the_way",
//       "message": "Driver is heading your way",
//       "estimatedTime": "10 min"
//     },
//     "name": "Delivery Update"
//   }
//
// To mark delivered:
//   "event_updates": {
//     "status": "delivered",
//     "message": "Order delivered!",
//     "estimatedTime": ""
//   }
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  onStart: (activityId: string, attributes: object, content: object) => void;
  onExit: (activityId: string) => void;
  onInfoTap?: () => void;
}

export default function LiveActivitySection({
  onStart,
  onExit,
  onInfoTap,
}: Props) {
  const [activityId, setActivityId] = useState('order-1');
  const [orderNumber, setOrderNumber] = useState('ORD-1234');

  const handleStart = () => {
    onStart(
      activityId,
      { orderNumber },
      {
        status: 'preparing',
        message: 'Your order is being prepared',
        estimatedTime: '15 min',
      },
    );
  };

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
      </View>
      <Text style={styles.hint}>
        After starting, send a push-to-update from the OneSignal API to change the status.
      </Text>
      <View style={styles.buttons}>
        <ActionButton
          label="START LIVE ACTIVITY"
          onPress={handleStart}
          disabled={!activityId.trim()}
          testID="start_live_activity_button"
        />
        <ActionButton
          label="EXIT LIVE ACTIVITY"
          onPress={() => onExit(activityId)}
          disabled={!activityId.trim()}
          variant="outlined"
          testID="exit_live_activity_button"
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
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
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

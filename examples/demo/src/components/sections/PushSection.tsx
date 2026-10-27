import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface Props {
  pushSubscriptionId: string | undefined;
  pushSubscriptionToken: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  onSetPushEnabled: (value: boolean) => void;
  onPromptPush: () => void;
  onInfoTap?: () => void;
}

export default function PushSection({
  pushSubscriptionId,
  pushSubscriptionToken,
  isPushEnabled,
  hasNotificationPermission,
  onSetPushEnabled,
  onPromptPush,
  onInfoTap,
}: Props) {
  const isSubscribed = isPushEnabled && hasNotificationPermission && !!pushSubscriptionToken;

  return (
    <SectionCard title="Push" onInfoTap={onInfoTap} sectionKey="push">
      <View style={AppTheme.card}>
        <View style={styles.idRow}>
          <Text style={styles.idLabel}>Push ID</Text>
          <Text
            style={styles.idValue}
            numberOfLines={1}
            ellipsizeMode="middle"
            testID="push_id_value"
          >
            {pushSubscriptionId ?? '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.idRow}>
          <Text style={styles.idLabel}>Status</Text>
          <Text style={styles.statusValue} testID="push_subscription_status">
            {isSubscribed ? 'Subscribed' : 'Unsubscribed'}
          </Text>
        </View>
        <View style={styles.divider} />
        <ToggleRow
          label="Opted In"
          value={isPushEnabled}
          onValueChange={onSetPushEnabled}
          disabled={!hasNotificationPermission}
          testID="push_enabled_toggle"
        />
      </View>
      {!hasNotificationPermission && (
        <View style={styles.promptButtonWrap}>
          <ActionButton label="PROMPT PUSH" onPress={onPromptPush} testID="prompt_push_button" />
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
    minWidth: 60,
  },
  idValue: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  statusValue: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
  promptButtonWrap: {
    marginTop: AppSpacing.gap,
  },
});

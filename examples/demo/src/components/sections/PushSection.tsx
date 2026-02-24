import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';
import ActionButton from '../ActionButton';
import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';

interface Props {
  pushSubscriptionId: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  onSetPushEnabled: (value: boolean) => void;
  onPromptPush: () => void;
  onInfoTap?: () => void;
}

export default function PushSection({
  pushSubscriptionId,
  isPushEnabled,
  hasNotificationPermission,
  onSetPushEnabled,
  onPromptPush,
  onInfoTap,
}: Props) {
  return (
    <SectionCard title="Push" onInfoTap={onInfoTap}>
      <View style={AppTheme.card}>
        <View style={styles.idRow}>
          <Text style={styles.idLabel}>Push ID</Text>
          <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">
            {pushSubscriptionId ?? '–'}
          </Text>
        </View>
        <View style={styles.divider} />
        <ToggleRow
          label="Enabled"
          value={isPushEnabled}
          onValueChange={onSetPushEnabled}
          disabled={!hasNotificationPermission}
          testID="push_enabled_toggle"
        />
      </View>
      {!hasNotificationPermission && (
        <View style={styles.promptButtonWrap}>
          <ActionButton
            label="PROMPT PUSH"
            onPress={onPromptPush}
            testID="prompt_push_button"
          />
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
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
  promptButtonWrap: {
    marginTop: AppSpacing.gap,
  },
});

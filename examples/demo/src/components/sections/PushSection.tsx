import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';
import ActionButton from '../ActionButton';
import { Colors, AppTheme } from '../../theme';

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
        <ActionButton
          label="PROMPT PUSH"
          onPress={onPromptPush}
          testID="prompt_push_button"
        />
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
    fontSize: 14,
    color: Colors.textSecondary,
    minWidth: 60,
  },
  idValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerColor,
    marginVertical: 8,
  },
});

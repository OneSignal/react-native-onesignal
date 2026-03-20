import React from 'react';
import { View } from 'react-native';

import { AppTheme } from '../../theme';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface Props {
  inAppMessagesPaused: boolean;
  onSetPaused: (value: boolean) => void;
  onInfoTap?: () => void;
}

export default function InAppSection({ inAppMessagesPaused, onSetPaused, onInfoTap }: Props) {
  return (
    <SectionCard title="In-App Messaging" onInfoTap={onInfoTap}>
      <View style={AppTheme.card}>
        <ToggleRow
          label="Pause In-App Messages"
          description="Toggle in-app message display"
          value={inAppMessagesPaused}
          onValueChange={onSetPaused}
          testID="iam_pause_toggle"
        />
      </View>
    </SectionCard>
  );
}

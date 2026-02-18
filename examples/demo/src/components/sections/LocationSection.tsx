import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';
import ActionButton from '../ActionButton';
import { AppTheme, Spacing } from '../../theme';

interface Props {
  locationShared: boolean;
  onSetLocationShared: (value: boolean) => void;
  onRequestLocationPermission: () => void;
  onInfoTap?: () => void;
}

export default function LocationSection({
  locationShared,
  onSetLocationShared,
  onRequestLocationPermission,
  onInfoTap,
}: Props) {
  return (
    <SectionCard title="Location" onInfoTap={onInfoTap}>
      <View style={[AppTheme.card, styles.locationCard]}>
        <ToggleRow
          label="Location Shared"
          description="Share device location with OneSignal"
          value={locationShared}
          onValueChange={onSetLocationShared}
          testID="location_shared_toggle"
        />
      </View>
      <ActionButton
        label="PROMPT LOCATION"
        onPress={onRequestLocationPermission}
        testID="prompt_location_button"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    marginBottom: Spacing.cardGap,
  },
});

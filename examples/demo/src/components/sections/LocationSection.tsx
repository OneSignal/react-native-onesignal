import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppTheme, AppSpacing } from '../../theme';
import { showSnackbar } from '../../utils/showSnackbar';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface Props {
  locationShared: boolean;
  onSetLocationShared: (value: boolean) => void;
  onCheckLocationShared: () => Promise<boolean>;
  onRequestLocationPermission: () => void;
  onInfoTap?: () => void;
}

export default function LocationSection({
  locationShared,
  onSetLocationShared,
  onCheckLocationShared,
  onRequestLocationPermission,
  onInfoTap,
}: Props) {
  const handleCheckLocation = async () => {
    const shared = await onCheckLocationShared();
    showSnackbar(`Location shared: ${shared}`);
  };

  return (
    <SectionCard title="Location" onInfoTap={onInfoTap} sectionKey="location">
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
      <ActionButton
        label="CHECK LOCATION SHARED"
        onPress={handleCheckLocation}
        variant="outlined"
        testID="check_location_button"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    marginBottom: AppSpacing.gap,
  },
});

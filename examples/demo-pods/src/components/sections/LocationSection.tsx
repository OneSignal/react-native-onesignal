import React from 'react';
import { View, StyleSheet } from 'react-native';

import { AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import ButtonGrid from '../ButtonGrid';
import SectionCard from '../SectionCard';
import { useSnackbar } from '../ToastProvider';
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
  const showSnackbar = useSnackbar();

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
      <ButtonGrid>
        <ActionButton
          label="PROMPT LOCATION"
          onPress={onRequestLocationPermission}
          testID="prompt_location_button"
        />
        <ActionButton
          label="CHECK LOCATION"
          onPress={handleCheckLocation}
          testID="check_location_button"
        />
      </ButtonGrid>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    marginBottom: AppSpacing.gap,
  },
});

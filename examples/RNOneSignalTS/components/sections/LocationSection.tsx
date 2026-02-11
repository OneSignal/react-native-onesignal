import React from 'react';
import { StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ToggleRow } from '../common/ToggleRow';
import { ActionButton } from '../common/ActionButton';
import { useAppState } from '../../context/AppStateContext';

interface LocationSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function LocationSection({ loggingFunction }: LocationSectionProps) {
  const { state, dispatch } = useAppState();

  const handleToggleLocation = (shared: boolean) => {
    if (shared) {
      loggingFunction('Sharing location');
    } else {
      loggingFunction('Unsharing location');
    }
    OneSignal.Location.setShared(shared);
    dispatch({ type: 'SET_LOCATION_SHARED', payload: shared });
  };

  const handleRequestPermission = () => {
    loggingFunction('Request Location permission');
    OneSignal.Location.requestPermission();
  };

  return (
    <Card>
      <SectionHeader title="Location" tooltipKey="location" />
      <ToggleRow
        label="Share Location"
        value={state.locationShared}
        onValueChange={handleToggleLocation}
      />
      <ActionButton
        title="Request Permission"
        onPress={handleRequestPermission}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

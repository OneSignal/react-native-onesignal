import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Colors } from '../../constants/Colors';
import { APP_ID } from '../../constants/Config';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ToggleRow } from '../common/ToggleRow';
import { useAppState } from '../../context/AppStateContext';

interface AppInfoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function AppInfoSection({ loggingFunction }: AppInfoSectionProps) {
  const { state, dispatch } = useAppState();

  const handleToggleConsentRequired = (required: boolean) => {
    loggingFunction(`Setting consent required: ${required}`);
    OneSignal.setConsentRequired(required);
    dispatch({ type: 'SET_CONSENT_REQUIRED', payload: required });
    if (!required) {
      // When disabling consent required, also reset consent given
      dispatch({ type: 'SET_CONSENT_GIVEN', payload: false });
    }
  };

  const handleToggleConsentGiven = async (granted: boolean) => {
    loggingFunction(`Setting privacy consent: ${granted}`);
    await OneSignal.setConsentGiven(granted);
    dispatch({ type: 'SET_CONSENT_GIVEN', payload: granted });
  };

  const handleOpenOneSignal = () => {
    Linking.openURL('https://onesignal.com');
  };

  return (
    <Card>
      <SectionHeader title="App" tooltipKey="app" />

      {/* App ID Display */}
      <View style={styles.row}>
        <Text style={styles.label}>App ID:</Text>
        <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
          {APP_ID}
        </Text>
      </View>

      {/* Guidance Banner */}
      <View style={styles.guidanceBanner}>
        <Text style={styles.guidanceText}>
          Add your own App ID, then rebuild to fully test all functionality.
        </Text>
        <TouchableOpacity onPress={handleOpenOneSignal}>
          <Text style={styles.guidanceLink}>Get your keys at onesignal.com</Text>
        </TouchableOpacity>
      </View>

      {/* Consent Required Toggle */}
      <ToggleRow
        label="Consent Required"
        description="Require consent before SDK processes data"
        value={state.consentRequired}
        onValueChange={handleToggleConsentRequired}
      />

      {/* Privacy Consent Toggle - only visible when Consent Required is ON */}
      {state.consentRequired && (
        <ToggleRow
          label="Privacy Consent"
          description="Consent given for data collection"
          value={state.consentGiven}
          onValueChange={handleToggleConsentGiven}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 4,
  },
  guidanceBanner: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  guidanceText: {
    fontSize: 14,
    color: Colors.darkText,
    marginBottom: 4,
  },
  guidanceLink: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

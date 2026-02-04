import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { Colors } from '../../constants/Colors';

interface AppInfoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
  inputValue: string;
}

export function AppInfoSection({
  loggingFunction,
  inputValue,
}: AppInfoSectionProps) {
  const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

  const handleLogin = () => {
    loggingFunction('Attempting to login a user: ', inputValue);
    OneSignal.login(inputValue);
  };

  const handleLogout = () => {
    loggingFunction('Attempting to logout a user');
    OneSignal.logout();
  };

  const handleRevokeConsent = async () => {
    loggingFunction('Revoking privacy consent');
    await OneSignal.setConsentGiven(false);
  };

  return (
    <Card>
      <SectionHeader title="App Info" />
      <View style={styles.row}>
        <Text style={styles.label}>App ID:</Text>
        <Text style={styles.value}>{APP_ID}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Login"
          onPress={handleLogin}
          style={styles.button}
        />
        <ActionButton
          title="Logout"
          onPress={handleLogout}
          style={styles.button}
        />
      </View>
      <ActionButton
        title="Revoke Consent"
        onPress={handleRevokeConsent}
        style={styles.revokeButton}
      />
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  revokeButton: {
    marginTop: 8,
  },
});

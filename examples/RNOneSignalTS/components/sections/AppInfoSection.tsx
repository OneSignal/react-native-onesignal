import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Colors } from '../../constants/Colors';
import { APP_ID } from '../../constants/Config';
import { ActionButton } from '../common/ActionButton';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { LoginUserDialog } from '../dialogs/LoginUserDialog';

interface AppInfoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function AppInfoSection({ loggingFunction }: AppInfoSectionProps) {
  const [loginDialogVisible, setLoginDialogVisible] = useState(false);

  const handleLogin = (externalId: string) => {
    loggingFunction('Attempting to login a user: ', externalId);
    OneSignal.login(externalId);
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
          title="Login User"
          onPress={() => setLoginDialogVisible(true)}
          style={styles.button}
        />
        <ActionButton
          title="Logout User"
          onPress={handleLogout}
          style={styles.button}
        />
      </View>
      <ActionButton
        title="Revoke Consent"
        onPress={handleRevokeConsent}
        style={styles.revokeButton}
      />
      <LoginUserDialog
        visible={loginDialogVisible}
        onClose={() => setLoginDialogVisible(false)}
        onConfirm={handleLogin}
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

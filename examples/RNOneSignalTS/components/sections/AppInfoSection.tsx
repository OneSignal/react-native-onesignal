import React, { useState } from 'react';
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
import { ActionButton } from '../common/ActionButton';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ToggleRow } from '../common/ToggleRow';
import { LoginUserDialog } from '../dialogs/LoginUserDialog';
import { useAppState } from '../../context/AppStateContext';

interface AppInfoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function AppInfoSection({ loggingFunction }: AppInfoSectionProps) {
  const { state, dispatch } = useAppState();
  const [loginDialogVisible, setLoginDialogVisible] = useState(false);

  const handleLogin = async (externalId: string) => {
    loggingFunction('Attempting to login a user: ', externalId);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await OneSignal.login(externalId);
      dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: externalId });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleLogout = async () => {
    loggingFunction('Attempting to logout a user');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await OneSignal.logout();
      dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: null });
      // Clear user data on logout
      dispatch({ type: 'CLEAR_ALL_ALIASES' });
      dispatch({ type: 'SET_ALL_EMAILS', payload: [] });
      dispatch({ type: 'SET_ALL_SMS', payload: [] });
      dispatch({ type: 'CLEAR_ALL_TRIGGERS' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleToggleConsent = async (granted: boolean) => {
    loggingFunction(`Setting privacy consent: ${granted}`);
    await OneSignal.setConsentGiven(granted);
    dispatch({ type: 'SET_CONSENT_GIVEN', payload: granted });
  };

  const handleOpenOneSignal = () => {
    Linking.openURL('https://onesignal.com');
  };

  const isLoggedIn = state.externalUserId !== null;

  return (
    <Card>
      <SectionHeader title="App" />

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

      {/* Privacy Consent Toggle */}
      <ToggleRow
        label="Privacy Consent"
        description="Grant or revoke privacy consent"
        value={state.consentGiven}
        onValueChange={handleToggleConsent}
      />

      {/* Logged In As Display */}
      {isLoggedIn && (
        <View style={styles.loggedInCard}>
          <Text style={styles.loggedInLabel}>Logged in as:</Text>
          <Text style={styles.loggedInUserId}>{state.externalUserId}</Text>
        </View>
      )}

      {/* Login/Logout Buttons */}
      <View style={styles.buttonContainer}>
        <ActionButton
          title={isLoggedIn ? 'Switch User' : 'Login User'}
          onPress={() => setLoginDialogVisible(true)}
          style={styles.button}
        />
        <ActionButton
          title="Logout User"
          onPress={handleLogout}
          style={styles.button}
        />
      </View>

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
  loggedInCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  loggedInLabel: {
    fontSize: 16,
    color: Colors.darkText,
  },
  loggedInUserId: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
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
});

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Colors } from '../../constants/Colors';
import { ActionButton } from '../common/ActionButton';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { LoginUserDialog } from '../dialogs/LoginUserDialog';
import { useAppState } from '../../context/AppStateContext';

interface UserSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function UserSection({ loggingFunction }: UserSectionProps) {
  const { state, dispatch } = useAppState();
  const [loginDialogVisible, setLoginDialogVisible] = useState(false);

  const isLoggedIn = state.externalUserId !== null;

  const handleLogin = async (externalId: string) => {
    loggingFunction('Attempting to login user: ', externalId);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await OneSignal.login(externalId);
      dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: externalId });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleLogout = async () => {
    loggingFunction('Attempting to logout user');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await OneSignal.logout();
      dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: null });
      dispatch({ type: 'CLEAR_ALL_ALIASES' });
      dispatch({ type: 'SET_ALL_EMAILS', payload: [] });
      dispatch({ type: 'SET_ALL_SMS', payload: [] });
      dispatch({ type: 'CLEAR_ALL_TRIGGERS' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Card>
      <SectionHeader title="User" />

      {/* Status Row */}
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        {isLoggedIn ? (
          <View style={styles.statusBadgeLoggedIn}>
            <Text style={styles.statusTextLoggedIn}>Logged In</Text>
          </View>
        ) : (
          <Text style={styles.statusTextAnonymous}>Anonymous</Text>
        )}
      </View>

      {/* External ID Row */}
      <View style={styles.row}>
        <Text style={styles.label}>External ID</Text>
        <Text style={styles.value}>
          {state.externalUserId ?? '—'}
        </Text>
      </View>

      {/* Login / Switch User Button */}
      <View style={styles.buttonContainer}>
        <ActionButton
          title={isLoggedIn ? 'Switch User' : 'Login User'}
          onPress={() => setLoginDialogVisible(true)}
          style={styles.button}
        />
        {isLoggedIn && (
          <ActionButton
            title="Logout User"
            onPress={handleLogout}
            variant="outline"
            style={styles.button}
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  label: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: '600',
  },
  statusBadgeLoggedIn: {
    backgroundColor: Colors.greenLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusTextLoggedIn: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: '600',
  },
  statusTextAnonymous: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  button: {
    width: '100%',
  },
});

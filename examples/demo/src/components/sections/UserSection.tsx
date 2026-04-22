import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';
import { showSnackbar } from '../../utils/showSnackbar';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface Props {
  externalUserId: string | undefined;
  onLogin: (externalUserId: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function UserSection({ externalUserId, onLogin, onLogout }: Props) {
  const [loginVisible, setLoginVisible] = useState(false);
  const isLoggedIn = !!externalUserId;

  const handleLogin = async (userId: string) => {
    try {
      await onLogin(userId);
      showSnackbar(`Logged in as ${userId}`);
    } catch (err) {
      showSnackbar(`Login failed: ${String(err)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      showSnackbar('User logged out');
    } catch (err) {
      showSnackbar(`Logout failed: ${String(err)}`);
    }
  };

  return (
    <SectionCard title="User" sectionKey="user">
      <View style={[AppTheme.card, styles.card]}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[styles.value, isLoggedIn && styles.loggedInText]}
            testID="user_status_value"
          >
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>External ID</Text>
          <Text style={styles.value} numberOfLines={1} testID="user_external_id_value">
            {externalUserId ?? '–'}
          </Text>
        </View>
      </View>
      <ActionButton
        label={isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
        onPress={() => setLoginVisible(true)}
        testID="login_user_button"
      />
      {isLoggedIn && (
        <ActionButton
          label="LOGOUT USER"
          onPress={handleLogout}
          variant="outlined"
          testID="logout_user_button"
        />
      )}
      <SingleInputModal
        visible={loginVisible}
        title="Login User"
        placeholder="External User Id"
        confirmLabel="Login"
        onConfirm={handleLogin}
        onClose={() => setLoginVisible(false)}
        testID="login_user_id_input"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: AppSpacing.gap,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
  },
  value: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
    fontFamily: 'monospace',
  },
  loggedInText: {
    color: AppColors.osSuccess,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
});

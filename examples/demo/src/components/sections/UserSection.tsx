import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import LoginModal from '../modals/LoginModal';
import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';

interface Props {
  externalUserId: string | undefined;
  onLogin: (externalUserId: string) => void;
  onLogout: () => void;
}

export default function UserSection({
  externalUserId,
  onLogin,
  onLogout,
}: Props) {
  const [loginVisible, setLoginVisible] = useState(false);
  const isLoggedIn = !!externalUserId;

  return (
    <SectionCard title="User">
      <View style={[AppTheme.card, styles.card]}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, isLoggedIn && styles.loggedInText]}>
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>External ID</Text>
          <Text style={styles.value} numberOfLines={1}>
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
          onPress={onLogout}
          variant="outlined"
          testID="logout_user_button"
        />
      )}
      <LoginModal
        visible={loginVisible}
        onConfirm={onLogin}
        onClose={() => setLoginVisible(false)}
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

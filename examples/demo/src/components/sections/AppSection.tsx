import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';
import ActionButton from '../ActionButton';
import LoginModal from '../modals/LoginModal';
import { Colors, AppTheme } from '../../theme';

interface Props {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  onSetConsentRequired: (value: boolean) => void;
  onSetConsentGiven: (value: boolean) => void;
  onLogin: (userId: string) => void;
  onLogout: () => void;
  onInfoTap?: () => void;
}

export default function AppSection({
  appId,
  consentRequired,
  privacyConsentGiven,
  externalUserId,
  onSetConsentRequired,
  onSetConsentGiven,
  onLogin,
  onLogout,
  onInfoTap,
}: Props) {
  const [loginVisible, setLoginVisible] = useState(false);
  const isLoggedIn = !!externalUserId;

  return (
    <SectionCard title="App" onInfoTap={onInfoTap}>
      {/* App ID display */}
      <View style={AppTheme.card}>
        <View style={styles.idRow}>
          <Text style={styles.idLabel}>App ID</Text>
          <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">
            {appId}
          </Text>
        </View>
      </View>

      {/* Guidance Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Add your own App ID, then rebuild to fully test all functionality.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://onesignal.com')}>
          <Text style={styles.bannerLink}>Get your keys at onesignal.com</Text>
        </TouchableOpacity>
      </View>

      {/* Consent Card */}
      <View style={AppTheme.card}>
        <ToggleRow
          label="Consent Required"
          description="Require consent before SDK processes data"
          value={consentRequired}
          onValueChange={onSetConsentRequired}
          testID="consent_required_toggle"
        />
        {consentRequired && (
          <>
            <View style={styles.divider} />
            <ToggleRow
              label="Privacy Consent"
              description="Consent given for data collection"
              value={privacyConsentGiven}
              onValueChange={onSetConsentGiven}
              testID="privacy_consent_toggle"
            />
          </>
        )}
      </View>

      {/* User Status Card */}
      <View style={[AppTheme.card, styles.userCard]}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, isLoggedIn && styles.loggedInText]}>
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>External ID</Text>
          <Text style={styles.statusValue} numberOfLines={1}>
            {externalUserId ?? '–'}
          </Text>
        </View>
      </View>

      {/* Login/Logout Buttons */}
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
        isLoggedIn={isLoggedIn}
        onConfirm={onLogin}
        onClose={() => setLoginVisible(false)}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  idValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  banner: {
    backgroundColor: Colors.warningBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bannerLink: {
    fontSize: 13,
    color: Colors.oneSignalRed,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerColor,
    marginVertical: 8,
  },
  userCard: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  loggedInText: {
    color: '#2E7D32',
  },
});

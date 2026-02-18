import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';
import { Colors, AppTheme, Spacing } from '../../theme';

interface Props {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  onSetConsentRequired: (value: boolean) => void;
  onSetConsentGiven: (value: boolean) => void;
}

export default function AppSection({
  appId,
  consentRequired,
  privacyConsentGiven,
  onSetConsentRequired,
  onSetConsentGiven,
}: Props) {
  return (
    <SectionCard title="App">
      {/* App ID display */}
      <View style={[AppTheme.card, styles.appIdCard]}>
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
        <TouchableOpacity
          onPress={() => Linking.openURL('https://onesignal.com')}
        >
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
            <View style={AppTheme.divider} />
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
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  appIdCard: {
    marginBottom: Spacing.cardGap,
  },
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
    marginBottom: Spacing.cardGap,
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
});

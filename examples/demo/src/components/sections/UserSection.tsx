import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import SingleSelectModal, { type SelectOption } from '../modals/SingleSelectModal';
import SectionCard from '../SectionCard';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: 'Device Default', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Azerbaijani', value: 'az' },
  { label: 'Bosnian', value: 'bs' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Chinese (Simplified)', value: 'zh-Hans' },
  { label: 'Chinese (Traditional)', value: 'zh-Hant' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Czech', value: 'cs' },
  { label: 'Danish', value: 'da' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Estonian', value: 'et' },
  { label: 'Finnish', value: 'fi' },
  { label: 'French', value: 'fr' },
  { label: 'Georgian', value: 'ka' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'German', value: 'de' },
  { label: 'Greek', value: 'el' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Malay', value: 'ms' },
  { label: 'Norwegian', value: 'nb' },
  { label: 'Persian', value: 'fa' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Spanish', value: 'es' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Thai', value: 'th' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Vietnamese', value: 'vi' },
];

interface Props {
  externalUserId: string | undefined;
  language: string;
  onLogin: (externalUserId: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onSetLanguage: (language: string) => Promise<void>;
}

export default function UserSection({
  externalUserId,
  language,
  onLogin,
  onLogout,
  onSetLanguage,
}: Props) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const isLoggedIn = !!externalUserId;
  const languageLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language;

  const handleLogin = async (userId: string) => {
    await onLogin(userId);
  };

  const handleLogout = async () => {
    await onLogout();
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
            {externalUserId ?? '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => setLanguageOpen(true)}
          testID="user_language_dropdown"
        >
          <Text style={styles.label}>Language</Text>
          <View style={styles.dropdownValue}>
            <Text style={styles.languageValue} testID="user_language_value">
              {languageLabel}
            </Text>
            <Icon name="arrow-drop-down" size={22} color={AppColors.osGrey600} />
          </View>
        </TouchableOpacity>
      </View>
      <ActionButton
        label={isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
        onPress={() => setLoginOpen(true)}
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
        visible={loginOpen}
        title="Login User"
        placeholder="External User Id"
        confirmLabel="Login"
        onConfirm={handleLogin}
        onClose={() => setLoginOpen(false)}
        testID="login_user_id_input"
      />
      <SingleSelectModal
        visible={languageOpen}
        title="Language"
        options={LANGUAGE_OPTIONS}
        selectedValue={language}
        onSelect={onSetLanguage}
        onClose={() => setLanguageOpen(false)}
        testIDPrefix="language_option"
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
  dropdownValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
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

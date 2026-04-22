import { StyleSheet, type TextInputProps } from 'react-native';

export const AppColors = {
  osPrimary: '#E54B4D',
  osSuccess: '#34A853',
  osGrey700: '#616161',
  osGrey600: '#757575',
  osGrey500: '#9E9E9E',
  osLightBackground: '#F8F9FA',
  osCardBackground: '#FFFFFF',
  osCardBorder: 'rgba(0, 0, 0, 0.1)',
  osDivider: '#E8EAED',
  osWarningBackground: '#FFF8E1',
  osBackdrop: 'rgba(0,0,0,0.54)',
  white: '#FFFFFF',
} as const;

export const AppSpacing = {
  gap: 8,
  sectionVertical: 24,
  sectionHorizontal: 16,
} as const;

export const AppTextStyles = StyleSheet.create({
  bodyLarge: { fontSize: 16, fontWeight: '400' },
  bodyMedium: { fontSize: 14, fontWeight: '400' },
  bodySmall: { fontSize: 12, fontWeight: '400' },
});

export const AppTheme = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: AppColors.osCardBackground,
    padding: 12,
    borderWidth: 2,
    borderColor: AppColors.osCardBorder,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
});

export const AppInputProps: TextInputProps = {
  autoCorrect: false,
  autoCapitalize: 'none',
  autoComplete: 'off',
  // Prevents Android Autofill / Credential Manager from walking the input on focus.
  // Without this, Android 14+ rebuilds the AssistStructure when a new input
  // appears (e.g. revealing the "Value" field in OutcomeModal) and force-stops
  // the UiAutomator2 instrumentation, making Appium tests fail mid-suite.
  importantForAutofill: 'no',
};

export const AppDialogStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: AppColors.osBackdrop,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: AppColors.osCardBackground,
    borderRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#212121',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.osGrey700,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    color: '#212121',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingBottom: 24,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.osPrimary,
  },
  actionTextDisabled: {
    color: AppColors.osGrey500,
  },
});

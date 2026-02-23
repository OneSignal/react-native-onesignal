import { StyleSheet } from 'react-native';

export const AppColors = {
  osPrimary: '#E54B4D',
  osSuccess: '#34A853',
  osGrey700: '#616161',
  osGrey600: '#757575',
  osGrey500: '#9E9E9E',
  osLightBackground: '#F8F9FA',
  osCardBackground: '#FFFFFF',
  osDivider: '#E8EAED',
  osWarningBackground: '#FFF8E1',
  osOverlayScrim: 'rgba(0,0,0,0.26)',
  osLogBackground: '#1A1B1E',
  osLogDebug: '#82AAFF',
  osLogInfo: '#C3E88D',
  osLogWarn: '#FFCB6B',
  osLogError: '#FF5370',
  osLogTimestamp: '#676E7B',
  white: '#FFFFFF',
} as const;

export const AppSpacing = {
  gap: 8,
  sectionVertical: 24,
  sectionHorizontal: 16,
} as const;

export const AppTheme = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: AppColors.osCardBackground,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
});

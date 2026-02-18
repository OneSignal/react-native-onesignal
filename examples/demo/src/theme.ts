import { StyleSheet } from 'react-native';

export const Spacing = {
  cardGap: 8,
  sectionGap: 12,
} as const;

export const Colors = {
  oneSignalRed: '#E54B4D',
  oneSignalGreen: '#34A853',
  oneSignalGreenLight: '#E6F4EA',
  lightBackground: '#F8F9FA',
  cardBackground: '#FFFFFF',
  dividerColor: '#E8EAED',
  warningBackground: '#FFF8E1',
  textPrimary: '#212121',
  textSecondary: '#757575',
  logBackground: '#1A1B1E',
  logText: '#E0E0E0',
  headerBackground: '#E54B4D',
  destructiveRed: '#E9444E',
  white: '#FFFFFF',
};

export const Typography = {
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  cardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};

export const AppTheme = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.oneSignalRed,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerColor,
    marginVertical: 8,
  },
});

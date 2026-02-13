import { Colors } from './Colors';

export const CommonStyles = {
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 220, 224, 0.5)', // surfaceBorder at 50% opacity
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.secondaryText,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 44,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  outlineButton: {
    backgroundColor: 'transparent' as const,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(229, 75, 77, 0.5)', // primary at 50% opacity
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
};

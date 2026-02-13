import { Colors } from './Colors';

export const CommonStyles = {
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.darkText,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 56,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
  },
};

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
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
};

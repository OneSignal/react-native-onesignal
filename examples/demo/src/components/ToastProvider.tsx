import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';
import Toast from 'react-native-toast-message';

const TOAST_DURATION_MS = 3000;

type ShowSnackbar = (message: string) => void;

const ToastContext = createContext<ShowSnackbar | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const showSnackbar = useCallback<ShowSnackbar>((message) => {
    // Hide first so a new message replaces any in-flight toast and restarts
    // the visibility timer instead of queuing behind it.
    Toast.hide();
    Toast.show({ type: 'info', text1: message, visibilityTime: TOAST_DURATION_MS });
  }, []);

  return (
    <ToastContext.Provider value={showSnackbar}>
      {children}
      <Toast position="bottom" bottomOffset={20} />
    </ToastContext.Provider>
  );
};

export function useSnackbar(): ShowSnackbar {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within ToastProvider');
  }
  return ctx;
}

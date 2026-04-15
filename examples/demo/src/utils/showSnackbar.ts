import Toast from 'react-native-toast-message';

export function showSnackbar(message: string): void {
  Toast.hide();
  Toast.show({ type: 'info', text1: message });
}

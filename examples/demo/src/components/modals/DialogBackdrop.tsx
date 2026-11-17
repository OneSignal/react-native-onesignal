import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDialogStyles } from '../../theme';

/**
 * Top-anchored dialog backdrop. A dialog that moves while open desyncs
 * XCUITest frame reporting from the rendered layout; keyboard padding only
 * shrinks the space below, so the dialog stays put.
 */
export default function DialogBackdrop({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[
        AppDialogStyles.backdrop,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

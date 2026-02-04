import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface AddEmailDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
}

export function AddEmailDialog({
  visible,
  onClose,
  onConfirm,
}: AddEmailDialogProps) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!visible) {
      setEmail('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (email.trim()) {
      onConfirm(email.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="Add Email"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!email.trim()}
    >
      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
});

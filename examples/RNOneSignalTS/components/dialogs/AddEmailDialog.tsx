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
      title="New Email"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!email.trim()}
      confirmText="Add"
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkText,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.darkText,
  },
});

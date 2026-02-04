import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface LoginUserDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (externalId: string) => void;
}

export function LoginUserDialog({
  visible,
  onClose,
  onConfirm,
}: LoginUserDialogProps) {
  const [externalId, setExternalId] = useState('test');

  useEffect(() => {
    if (!visible) {
      setExternalId('test');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (externalId.trim()) {
      onConfirm(externalId.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="External User Id"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!externalId.trim()}
      confirmText="Login"
    >
      <TextInput
        style={styles.input}
        placeholder="External User Id"
        value={externalId}
        onChangeText={setExternalId}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 8,
    fontSize: 16,
  },
});

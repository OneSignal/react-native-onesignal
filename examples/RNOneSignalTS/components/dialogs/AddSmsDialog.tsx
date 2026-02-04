import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface AddSmsDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => void;
}

export function AddSmsDialog({
  visible,
  onClose,
  onConfirm,
}: AddSmsDialogProps) {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!visible) {
      setPhone('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (phone.trim()) {
      onConfirm(phone.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="New SMS"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!phone.trim()}
      confirmText="Add"
    >
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
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

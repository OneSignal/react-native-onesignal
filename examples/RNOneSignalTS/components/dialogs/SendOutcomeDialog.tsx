import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface SendOutcomeDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string, value?: number) => void;
}

export function SendOutcomeDialog({
  visible,
  onClose,
  onConfirm,
}: SendOutcomeDialogProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setValue('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (name.trim()) {
      const numValue = value.trim() ? parseFloat(value) : undefined;
      onConfirm(name.trim(), numValue);
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="Send Outcome"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!name.trim()}
    >
      <TextInput
        style={styles.input}
        placeholder="Outcome name"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Value (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Numeric value"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
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
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.darkText,
    marginBottom: 8,
  },
});

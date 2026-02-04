import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface AddPairDialogProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (key: string, value: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function AddPairDialog({
  visible,
  title,
  onClose,
  onConfirm,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: AddPairDialogProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) {
      setKey('');
      setValue('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (key.trim() && value.trim()) {
      onConfirm(key.trim(), value.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!key.trim() || !value.trim()}
      confirmText="Add"
    >
      <TextInput
        style={styles.input}
        placeholder={keyPlaceholder}
        value={key}
        onChangeText={setKey}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={valuePlaceholder}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
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
});

import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface TrackEventDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string, value?: string) => void;
}

export function TrackEventDialog({
  visible,
  onClose,
  onConfirm,
}: TrackEventDialogProps) {
  // Empty by default for Appium testing
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
      const eventValue = value.trim() || undefined;
      onConfirm(name.trim(), eventValue);
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="Track Event"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!name.trim()}
    >
      <Text style={styles.label}>Event Name (required)</Text>
      <TextInput
        style={styles.input}
        placeholder="Event name"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Event Value (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Event value"
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
  label: {
    fontSize: 14,
    color: Colors.darkText,
    marginBottom: 8,
    fontWeight: '600',
  },
});

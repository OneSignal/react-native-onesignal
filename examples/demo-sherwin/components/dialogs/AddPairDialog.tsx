import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
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
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{keyPlaceholder}</Text>
        <TextInput
          style={styles.input}
          placeholder={keyPlaceholder}
          value={key}
          onChangeText={setKey}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{valuePlaceholder}</Text>
        <TextInput
          style={styles.input}
          placeholder={valuePlaceholder}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
        />
      </View>
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.darkText,
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkText,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.darkText,
  },
});

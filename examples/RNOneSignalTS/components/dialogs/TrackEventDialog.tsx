import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface TrackEventDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string, properties?: Record<string, unknown>) => void;
}

export function TrackEventDialog({
  visible,
  onClose,
  onConfirm,
}: TrackEventDialogProps) {
  // Empty by default for Appium testing
  const [name, setName] = useState('');
  const [propertiesJson, setPropertiesJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setPropertiesJson('');
      setJsonError('');
    }
  }, [visible]);

  const validateJson = (text: string) => {
    setPropertiesJson(text);
    if (text.trim() === '') {
      setJsonError('');
      return;
    }
    try {
      JSON.parse(text);
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const isValid = name.trim() !== '' && jsonError === '';

  const handleConfirm = () => {
    if (!isValid) {
      return;
    }
    let properties: Record<string, unknown> | undefined;
    if (propertiesJson.trim()) {
      try {
        properties = JSON.parse(propertiesJson.trim());
      } catch {
        return;
      }
    }
    onConfirm(name.trim(), properties);
    onClose();
  };

  return (
    <BaseDialog
      visible={visible}
      title="Track Event"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText="Track"
      confirmDisabled={!isValid}
    >
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Properties (JSON, optional)</Text>
      <TextInput
        style={[styles.input, styles.jsonInput, jsonError ? styles.inputError : null]}
        placeholder='{"key": "value"}'
        value={propertiesJson}
        onChangeText={validateJson}
        autoCapitalize="none"
        multiline
        numberOfLines={3}
      />
      {jsonError ? <Text style={styles.errorText}>{jsonError}</Text> : null}
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
  jsonInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 14,
    color: Colors.darkText,
    marginBottom: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: -8,
    marginBottom: 8,
  },
});

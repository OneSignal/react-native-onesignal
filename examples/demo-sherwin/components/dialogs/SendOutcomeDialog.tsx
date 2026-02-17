import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

export type OutcomeType = 'normal' | 'unique' | 'withValue';

interface SendOutcomeDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: OutcomeType, name: string, value?: number) => void;
}

const OUTCOME_TYPES: { id: OutcomeType; label: string }[] = [
  { id: 'normal', label: 'Normal Outcome' },
  { id: 'unique', label: 'Unique Outcome' },
  { id: 'withValue', label: 'Outcome with Value' },
];

export function SendOutcomeDialog({
  visible,
  onClose,
  onConfirm,
}: SendOutcomeDialogProps) {
  // Empty by default for Appium testing
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [selectedType, setSelectedType] = useState<OutcomeType>('normal');

  useEffect(() => {
    if (!visible) {
      setName('');
      setValue('');
      setSelectedType('normal');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (name.trim()) {
      const numValue =
        selectedType === 'withValue' && value.trim()
          ? parseFloat(value)
          : undefined;
      onConfirm(selectedType, name.trim(), numValue);
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="Send Outcome"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={
        !name.trim() || (selectedType === 'withValue' && !value.trim())
      }
    >
      {/* Outcome Type Selector */}
      <Text style={styles.label}>Outcome Type</Text>
      <View style={styles.typeContainer}>
        {OUTCOME_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.typeButtonSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type.id && styles.typeButtonTextSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Name Input */}
      <Text style={styles.label}>Outcome Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Outcome name"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />

      {/* Value Input (only for withValue type) */}
      {selectedType === 'withValue' && (
        <>
          <Text style={styles.label}>Value</Text>
          <TextInput
            style={styles.input}
            placeholder="Numeric value"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
          />
        </>
      )}
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
  typeContainer: {
    marginBottom: 16,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  typeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFEBEE',
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.darkText,
  },
  typeButtonTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

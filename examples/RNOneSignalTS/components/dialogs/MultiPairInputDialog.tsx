import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface KeyValueRow {
  key: string;
  value: string;
}

interface MultiPairInputDialogProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (pairs: KeyValueRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function MultiPairInputDialog({
  visible,
  title,
  onClose,
  onConfirm,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: MultiPairInputDialogProps) {
  const [rows, setRows] = useState<KeyValueRow[]>([{ key: '', value: '' }]);

  useEffect(() => {
    if (!visible) {
      setRows([{ key: '', value: '' }]);
    }
  }, [visible]);

  const updateRow = (index: number, field: 'key' | 'value', text: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: text } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const allFilled = rows.every(
    (row) => row.key.trim() !== '' && row.value.trim() !== '',
  );

  const handleConfirm = () => {
    if (allFilled) {
      onConfirm(
        rows.map((row) => ({ key: row.key.trim(), value: row.value.trim() })),
      );
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!allFilled}
      confirmText="Add All"
    >
      <ScrollView style={styles.scrollArea}>
        {rows.map((row, index) => (
          <View key={index} style={styles.rowContainer}>
            <View style={styles.inputsRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{keyPlaceholder}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={keyPlaceholder}
                  value={row.key}
                  onChangeText={(text) => updateRow(index, 'key', text)}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{valuePlaceholder}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={valuePlaceholder}
                  value={row.value}
                  onChangeText={(text) => updateRow(index, 'value', text)}
                  autoCapitalize="none"
                />
              </View>
              {rows.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeRow(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {index < rows.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addRowButton} onPress={addRow}>
        <Text style={styles.addRowButtonText}>+ ADD ROW</Text>
      </TouchableOpacity>
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 250,
  },
  rowContainer: {
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
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
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginTop: 12,
  },
  addRowButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addRowButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors, AppDialogStyles } from '../../theme';

interface Row {
  id: number;
  key: string;
  value: string;
}

let nextId = 0;
const makeRow = (): Row => ({ id: nextId++, key: '', value: '' });

interface Props {
  visible: boolean;
  title: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  onConfirm: (pairs: Record<string, string>) => void;
  onClose: () => void;
}

export default function MultiPairInputModal({
  visible,
  title,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<Row[]>([makeRow()]);

  const allFilled = rows.every(r => r.key.trim() && r.value.trim());

  const updateRow = useCallback(
    (id: number, field: 'key' | 'value', text: string) => {
      setRows(prev =>
        prev.map(r => (r.id === id ? { ...r, [field]: text } : r)),
      );
    },
    [],
  );

  const addRow = useCallback(() => {
    setRows(prev => [...prev, makeRow()]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleConfirm = () => {
    if (!allFilled) {
      return;
    }
    const pairs: Record<string, string> = {};
    for (const row of rows) {
      pairs[row.key.trim()] = row.value.trim();
    }
    onConfirm(pairs);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const reset = () => {
    setRows([makeRow()]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[AppDialogStyles.container, styles.containerMaxHeight]}>
          <Text style={AppDialogStyles.title}>{title}</Text>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {rows.map((row, idx) => (
              <View key={row.id}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.rowContainer}>
                  <TextInput
                    style={[AppDialogStyles.input, styles.halfInput]}
                    placeholder={keyPlaceholder}
                    placeholderTextColor={AppColors.osGrey600}
                    value={row.key}
                    onChangeText={t => updateRow(row.id, 'key', t)}
                    autoFocus={idx === 0}
                    testID={idx === 0 ? 'multi_pair_key_0' : undefined}
                  />
                  <TextInput
                    style={[AppDialogStyles.input, styles.halfInput]}
                    placeholder={valuePlaceholder}
                    placeholderTextColor={AppColors.osGrey600}
                    value={row.value}
                    onChangeText={t => updateRow(row.id, 'value', t)}
                    testID={idx === 0 ? 'multi_pair_value_0' : undefined}
                  />
                  {rows.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeRow(row.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name="close"
                        size={20}
                        color={AppColors.osGrey600}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addRow} style={styles.addRowBtn}>
              <Text style={styles.addRowText}>+ Add Row</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleClose}
            >
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleConfirm}
              disabled={!allFilled}
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !allFilled && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Add All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerMaxHeight: {
    maxHeight: '80%',
  },
  scroll: {
    maxHeight: 300,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
  addRowBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  addRowText: {
    color: AppColors.osPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});

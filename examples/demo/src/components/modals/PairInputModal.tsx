import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import { AppColors, AppDialogStyles, AppInputProps } from '../../theme';
import DialogBackdrop from './DialogBackdrop';

interface Props {
  visible: boolean;
  title: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  onConfirm: (key: string, value: string) => void;
  onClose: () => void;
  keyTestID?: string;
  valueTestID?: string;
}

export default function PairInputModal({
  visible,
  title,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  onConfirm,
  onClose,
  keyTestID,
  valueTestID,
}: Props) {
  const [keyValue, setKeyValue] = useState('');
  const [val, setVal] = useState('');

  const canSubmit = keyValue.trim() && val.trim();

  const handleConfirm = () => {
    if (!canSubmit) {
      return;
    }
    onConfirm(keyValue.trim(), val.trim());
    setKeyValue('');
    setVal('');
    onClose();
  };

  const handleClose = () => {
    setKeyValue('');
    setVal('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <DialogBackdrop>
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>{title}</Text>
          <View style={styles.row}>
            <TextInput
              style={[AppDialogStyles.input, styles.halfInput, styles.inputSpacing]}
              placeholder={keyPlaceholder}
              placeholderTextColor={AppColors.osGrey600}
              value={keyValue}
              onChangeText={setKeyValue}
              autoFocus
              {...AppInputProps}
              testID={keyTestID}
            />
            <TextInput
              style={[AppDialogStyles.input, styles.halfInput, styles.inputSpacing]}
              placeholder={valuePlaceholder}
              placeholderTextColor={AppColors.osGrey600}
              value={val}
              onChangeText={setVal}
              {...AppInputProps}
              testID={valueTestID}
            />
          </View>
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity style={AppDialogStyles.actionBtn} onPress={handleClose}>
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleConfirm}
              disabled={!canSubmit}
              testID="singlepair_confirm_button"
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !canSubmit && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </DialogBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  inputSpacing: {
    marginBottom: 12,
  },
});

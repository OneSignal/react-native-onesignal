import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../theme';

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={keyPlaceholder}
              placeholderTextColor="#9E9E9E"
              value={keyValue}
              onChangeText={setKeyValue}
              autoFocus
              testID={keyTestID}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={valuePlaceholder}
              placeholderTextColor="#9E9E9E"
              value={val}
              onChangeText={setVal}
              testID={valueTestID}
            />
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canSubmit && styles.disabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
            >
              <Text style={styles.confirmText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.dividerColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.oneSignalRed,
  },
  disabled: {
    opacity: 0.5,
  },
});

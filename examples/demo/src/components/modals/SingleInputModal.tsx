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
  placeholder: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  testID?: string;
}

export default function SingleInputModal({
  visible,
  title,
  placeholder,
  onConfirm,
  onClose,
  keyboardType = 'default',
  testID,
}: Props) {
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    if (!value.trim()) {
      return;
    }
    onConfirm(value.trim());
    setValue('');
    onClose();
  };

  const handleClose = () => {
    setValue('');
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
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#9E9E9E"
            value={value}
            onChangeText={setValue}
            keyboardType={keyboardType}
            autoFocus
            testID={testID}
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !value.trim() && styles.disabled]}
              onPress={handleConfirm}
              disabled={!value.trim()}
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
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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

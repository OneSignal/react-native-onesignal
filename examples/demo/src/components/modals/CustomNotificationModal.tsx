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
  onConfirm: (title: string, body: string) => void;
  onClose: () => void;
}

export default function CustomNotificationModal({
  visible,
  onConfirm,
  onClose,
}: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const canSubmit = title.trim() && body.trim();

  const handleConfirm = () => {
    if (!canSubmit) {
      return;
    }
    onConfirm(title.trim(), body.trim());
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
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
          <Text style={styles.title}>Custom Notification</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#9E9E9E"
            value={title}
            onChangeText={setTitle}
            autoFocus
            testID="custom_notification_title_input"
          />
          <TextInput
            style={styles.input}
            placeholder="Body"
            placeholderTextColor="#9E9E9E"
            value={body}
            onChangeText={setBody}
            testID="custom_notification_body_input"
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canSubmit && styles.disabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
            >
              <Text style={styles.confirmText}>SEND</Text>
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

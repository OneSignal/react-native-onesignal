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
  isLoggedIn: boolean;
  onConfirm: (externalUserId: string) => void;
  onClose: () => void;
}

export default function LoginModal({
  visible,
  isLoggedIn,
  onConfirm,
  onClose,
}: Props) {
  const [userId, setUserId] = useState('');

  const handleConfirm = () => {
    if (!userId.trim()) {
      return;
    }
    onConfirm(userId.trim());
    setUserId('');
    onClose();
  };

  const handleClose = () => {
    setUserId('');
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
          <Text style={styles.title}>
            {isLoggedIn ? 'Switch User' : 'Login User'}
          </Text>
          <Text style={styles.label}>External User Id</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#9E9E9E"
            value={userId}
            onChangeText={setUserId}
            autoFocus
            testID="login_user_id_input"
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !userId.trim() && styles.disabled]}
              onPress={handleConfirm}
              disabled={!userId.trim()}
              testID="login_confirm_button"
            >
              <Text style={styles.confirmText}>LOGIN</Text>
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
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
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

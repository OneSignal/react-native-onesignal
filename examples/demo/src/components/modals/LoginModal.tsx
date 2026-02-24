import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppColors, AppDialogStyles } from '../../theme';

interface Props {
  visible: boolean;
  onConfirm: (externalUserId: string) => void;
  onClose: () => void;
}

export default function LoginModal({
  visible,
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
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>
            Login User
          </Text>
          <Text style={styles.label}>External User Id</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder=""
            placeholderTextColor={AppColors.osGrey600}
            value={userId}
            onChangeText={setUserId}
            autoFocus
            testID="login_user_id_input"
          />
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
              disabled={!userId.trim()}
              testID="login_confirm_button"
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !userId.trim() && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: AppColors.osGrey600,
    marginBottom: 6,
  },
  inputSpacing: {
    marginBottom: 16,
  },
});

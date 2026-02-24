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
import { AppColors, AppDialogStyles } from '../../theme';

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
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>Custom Notification</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="Title"
            placeholderTextColor={AppColors.osGrey600}
            value={title}
            onChangeText={setTitle}
            autoFocus
            testID="custom_notification_title_input"
          />
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="Body"
            placeholderTextColor={AppColors.osGrey600}
            value={body}
            onChangeText={setBody}
            testID="custom_notification_body_input"
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
              disabled={!canSubmit}
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !canSubmit && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inputSpacing: {
    marginBottom: 12,
  },
});

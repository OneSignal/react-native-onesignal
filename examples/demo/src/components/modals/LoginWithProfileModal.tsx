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

import { AppColors, AppDialogStyles, AppInputProps } from '../../theme';

interface Props {
  visible: boolean;
  onConfirm: (externalUserId: string, email: string, sms: string, jwt: string) => void;
  onClose: () => void;
}

export default function LoginWithProfileModal({ visible, onConfirm, onClose }: Props) {
  const [externalUserId, setExternalUserId] = useState('');
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState('');
  const [jwt, setJwt] = useState('');

  const canSubmit = !!externalUserId.trim();

  const handleConfirm = () => {
    if (!canSubmit) {
      return;
    }
    onConfirm(externalUserId.trim(), email.trim(), sms.trim(), jwt.trim());
    handleClose();
  };

  const handleClose = () => {
    setExternalUserId('');
    setEmail('');
    setSms('');
    setJwt('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>Login With Profile</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="External User Id"
            placeholderTextColor={AppColors.osGrey600}
            value={externalUserId}
            onChangeText={setExternalUserId}
            autoFocus
            {...AppInputProps}
            testID="composite_login_user_id_input"
          />
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="Email (optional)"
            placeholderTextColor={AppColors.osGrey600}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            {...AppInputProps}
            testID="composite_login_email_input"
          />
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="SMS (optional)"
            placeholderTextColor={AppColors.osGrey600}
            value={sms}
            onChangeText={setSms}
            keyboardType="phone-pad"
            {...AppInputProps}
            testID="composite_login_sms_input"
          />
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="JWT Token (optional)"
            placeholderTextColor={AppColors.osGrey600}
            value={jwt}
            onChangeText={setJwt}
            {...AppInputProps}
            testID="composite_login_jwt_input"
          />
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity style={AppDialogStyles.actionBtn} onPress={handleClose}>
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleConfirm}
              disabled={!canSubmit}
              testID="composite_login_confirm_button"
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !canSubmit && AppDialogStyles.actionTextDisabled,
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
  inputSpacing: {
    marginBottom: 12,
  },
});

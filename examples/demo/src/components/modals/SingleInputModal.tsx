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
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>{title}</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder={placeholder}
            placeholderTextColor={AppColors.osGrey600}
            value={value}
            onChangeText={setValue}
            keyboardType={keyboardType}
            autoFocus
            testID={testID}
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
              disabled={!value.trim()}
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !value.trim() && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Add
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
    marginBottom: 16,
  },
});

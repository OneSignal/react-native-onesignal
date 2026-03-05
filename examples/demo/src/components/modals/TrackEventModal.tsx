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
import { AppColors, AppTextStyles, AppSpacing, AppDialogStyles } from '../../theme';

interface Props {
  visible: boolean;
  onConfirm: (name: string, properties?: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function TrackEventModal({
  visible,
  onConfirm,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [propertiesText, setPropertiesText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const validateJson = (text: string): boolean => {
    if (!text.trim()) {
      setJsonError('');
      return true;
    }
    try {
      JSON.parse(text);
      setJsonError('');
      return true;
    } catch {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  const handlePropertiesChange = (text: string) => {
    setPropertiesText(text);
    if (text.trim()) {
      validateJson(text);
    } else {
      setJsonError('');
    }
  };

  const canSubmit =
    name.trim() &&
    !jsonError &&
    (propertiesText.trim() === '' || !!propertiesText.trim());

  const handleConfirm = () => {
    if (!name.trim()) {
      return;
    }
    if (!validateJson(propertiesText)) {
      return;
    }
    let props: Record<string, unknown> | undefined;
    if (propertiesText.trim()) {
      props = JSON.parse(propertiesText) as Record<string, unknown>;
    }
    onConfirm(name.trim(), props);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPropertiesText('');
    setJsonError('');
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
          <Text style={AppDialogStyles.title}>Track Event</Text>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder=""
            placeholderTextColor={AppColors.osGrey600}
            value={name}
            onChangeText={setName}
            autoFocus
            testID="track_event_name_input"
          />
          <Text style={styles.label}>Properties (optional, JSON)</Text>
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing, styles.jsonInput]}
            placeholder={'{"key": "value"}'}
            placeholderTextColor={AppColors.osGrey600}
            value={propertiesText}
            onChangeText={handlePropertiesChange}
            multiline
            testID="track_event_properties_input"
          />
          {!!jsonError && <Text style={styles.errorText}>{jsonError}</Text>}
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
              testID="track_event_confirm_button"
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !canSubmit && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Track
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
    marginBottom: 12,
  },
  jsonInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osPrimary,
    marginBottom: AppSpacing.gap,
    marginTop: -AppSpacing.gap,
  },
});

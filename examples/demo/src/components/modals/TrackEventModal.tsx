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
import { Colors, Spacing } from '../../theme';

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
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Track Event</Text>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#9E9E9E"
            value={name}
            onChangeText={setName}
            autoFocus
            testID="track_event_name_input"
          />
          <Text style={styles.label}>Properties (optional, JSON)</Text>
          <TextInput
            style={[styles.input, styles.jsonInput]}
            placeholder={'{"key": "value"}'}
            placeholderTextColor="#9E9E9E"
            value={propertiesText}
            onChangeText={handlePropertiesChange}
            multiline
            testID="track_event_properties_input"
          />
          {!!jsonError && <Text style={styles.errorText}>{jsonError}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canSubmit && styles.disabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
              testID="track_event_confirm_button"
            >
              <Text style={styles.confirmText}>TRACK</Text>
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
    marginBottom: 12,
  },
  jsonInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: Colors.oneSignalRed,
    marginBottom: Spacing.cardGap,
    marginTop: -Spacing.cardGap,
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

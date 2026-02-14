import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface CustomNotificationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (title: string, body: string) => void;
}

export function CustomNotificationDialog({
  visible,
  onClose,
  onConfirm,
}: CustomNotificationDialogProps) {
  // Empty by default for Appium testing
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setBody('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (title.trim() && body.trim()) {
      onConfirm(title.trim(), body.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      visible={visible}
      title="Custom Notification"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!title.trim() || !body.trim()}
    >
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="sentences"
      />
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="Body"
        value={body}
        onChangeText={setBody}
        autoCapitalize="sentences"
        multiline
        numberOfLines={3}
      />
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  bodyInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

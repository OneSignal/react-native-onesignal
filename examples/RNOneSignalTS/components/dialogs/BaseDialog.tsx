import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface BaseDialogProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children: ReactNode;
  confirmDisabled?: boolean;
  confirmText?: string;
}

export function BaseDialog({
  visible,
  title,
  onClose,
  onConfirm,
  children,
  confirmDisabled = false,
  confirmText = 'Add',
}: BaseDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.content}>{children}</View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={onConfirm}
                disabled={confirmDisabled}
              >
                <Text style={[
                  styles.confirmButtonText,
                  confirmDisabled && styles.confirmButtonTextDisabled,
                ]}>
                  {confirmText.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    width: '85%',
    maxWidth: 400,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 16,
  },
  content: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: '#ccc',
  },
});

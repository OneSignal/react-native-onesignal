import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme';

interface Props {
  visible: boolean;
  title: string;
  items: [string, string][];
  onConfirm: (selectedKeys: string[]) => void;
  onClose: () => void;
}

export default function MultiSelectRemoveModal({
  visible,
  title,
  items,
  onConfirm,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm([...selected]);
    setSelected(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
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
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.scroll}>
            {items.map(([key]) => {
              const isChecked = selected.has(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.row}
                  onPress={() => toggle(key)}
                >
                  <Icon
                    name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={
                      isChecked ? Colors.oneSignalRed : Colors.textSecondary
                    }
                  />
                  <Text style={styles.itemKey}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                selected.size === 0 && styles.disabled,
              ]}
              onPress={handleConfirm}
              disabled={selected.size === 0}
            >
              <Text style={styles.confirmText}>REMOVE ({selected.size})</Text>
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
    maxHeight: '70%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  scroll: {
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  itemKey: {
    fontSize: 14,
    color: '#212121',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
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

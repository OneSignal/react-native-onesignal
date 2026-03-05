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
import { AppColors, AppTextStyles, AppDialogStyles } from '../../theme';

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
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[AppDialogStyles.container, styles.containerMaxHeight]}>
          <Text style={AppDialogStyles.title}>{title}</Text>
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
                      isChecked ? AppColors.osPrimary : AppColors.osGrey600
                    }
                  />
                  <Text style={styles.itemKey}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
              disabled={selected.size === 0}
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  selected.size === 0 && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Remove ({selected.size})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerMaxHeight: {
    maxHeight: '70%',
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
    ...AppTextStyles.bodyLarge,
    color: '#212121',
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BaseDialog } from './BaseDialog';
import { Colors } from '../../constants/Colors';

interface ItemPair {
  key: string;
  value: string;
}

interface MultiSelectRemoveDialogProps {
  visible: boolean;
  title: string;
  items: ItemPair[];
  onClose: () => void;
  onConfirm: (keys: string[]) => void;
}

export function MultiSelectRemoveDialog({
  visible,
  title,
  items,
  onClose,
  onConfirm,
}: MultiSelectRemoveDialogProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) {
      setSelectedKeys(new Set());
    }
  }, [visible]);

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
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
    if (selectedKeys.size > 0) {
      onConfirm(Array.from(selectedKeys));
      onClose();
    }
  };

  const selectedCount = selectedKeys.size;

  return (
    <BaseDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={selectedCount === 0}
      confirmText={`Remove (${selectedCount})`}
    >
      <ScrollView style={styles.scrollArea}>
        {items.map((item) => {
          const isSelected = selectedKeys.has(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.itemRow}
              onPress={() => toggleKey(item.key)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.itemText} numberOfLines={1}>
                {item.key}: {item.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </BaseDialog>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 300,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.secondaryText,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkText,
  },
});

import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppColors, AppTextStyles, AppDialogStyles } from '../../theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  testIDPrefix?: string;
}

export default function SingleSelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  testIDPrefix,
}: Props) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={AppDialogStyles.backdrop}>
        <View style={[AppDialogStyles.container, styles.containerMaxHeight]}>
          <Text style={AppDialogStyles.title}>{title}</Text>
          <ScrollView style={styles.scroll}>
            {options.map(({ label, value }) => {
              const isSelected = value === selectedValue;
              return (
                <TouchableOpacity
                  key={value}
                  style={styles.row}
                  onPress={() => handleSelect(value)}
                  testID={testIDPrefix ? `${testIDPrefix}_${value || 'default'}` : undefined}
                >
                  <Icon
                    name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                    color={isSelected ? AppColors.osPrimary : AppColors.osGrey600}
                  />
                  <Text style={styles.itemLabel}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity style={AppDialogStyles.actionBtn} onPress={onClose}>
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerMaxHeight: {
    maxHeight: '70%',
  },
  scroll: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  itemLabel: {
    ...AppTextStyles.bodyLarge,
    color: '#212121',
  },
});

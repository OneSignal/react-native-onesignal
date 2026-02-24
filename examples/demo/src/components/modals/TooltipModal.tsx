import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TooltipData } from '../../services/TooltipHelper';
import { AppColors, AppTextStyles, AppDialogStyles } from '../../theme';

interface Props {
  visible: boolean;
  tooltip: TooltipData | null;
  onClose: () => void;
}

export default function TooltipModal({ visible, tooltip, onClose }: Props) {
  if (!tooltip) {
    return null;
  }
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={AppDialogStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[AppDialogStyles.container, styles.containerMaxHeight]}>
          <Text style={AppDialogStyles.title}>{tooltip.title}</Text>
          <ScrollView>
            <Text style={styles.description}>{tooltip.description}</Text>
            {tooltip.options?.map(opt => (
              <View key={opt.name} style={styles.optionRow}>
                <Text style={styles.optionName}>{opt.name}</Text>
                <Text style={styles.optionDescription}>{opt.description}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={onClose}
            >
              <Text style={AppDialogStyles.actionText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerMaxHeight: {
    maxHeight: '70%',
  },
  description: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionRow: {
    marginBottom: 10,
  },
  optionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: AppColors.osGrey600,
  },
});

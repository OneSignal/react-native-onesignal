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
import { Colors } from '../../theme';

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
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{tooltip.title}</Text>
          <ScrollView>
            <Text style={styles.description}>{tooltip.description}</Text>
            {tooltip.options?.map(opt => (
              <View key={opt.name} style={styles.optionRow}>
                <Text style={styles.optionName}>{opt.name}</Text>
                <Text style={styles.optionDescription}>{opt.description}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.oneSignalRed,
    letterSpacing: 0.5,
  },
});

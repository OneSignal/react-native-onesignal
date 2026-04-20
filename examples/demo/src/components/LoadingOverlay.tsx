import React from 'react';
import { View, ActivityIndicator, Modal, StyleSheet } from 'react-native';

import { AppColors } from '../theme';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={AppColors.osPrimary} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.osBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

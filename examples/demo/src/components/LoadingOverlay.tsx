import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '../theme';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={AppColors.osPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.osBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

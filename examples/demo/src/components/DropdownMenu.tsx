import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppColors, AppTextStyles } from '../theme';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  anchor: DropdownAnchor | null;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  testIDPrefix?: string;
}

const MENU_WIDTH = 240;
const MENU_MAX_HEIGHT = 320;
const SCREEN_MARGIN = 16;

export default function DropdownMenu({
  anchor,
  options,
  selectedValue,
  onSelect,
  onClose,
  testIDPrefix,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  if (!anchor) {
    return null;
  }

  // measureInWindow excludes the Android status bar, but the translucent
  // modal draws under it.
  const offsetY = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  const anchorTop = anchor.y + offsetY;
  const anchorBottom = anchorTop + anchor.height;
  // Open upward when the menu would run past the bottom of the screen.
  const opensUp = anchorBottom + MENU_MAX_HEIGHT > screenHeight - SCREEN_MARGIN;
  const position = {
    right: Math.max(SCREEN_MARGIN, screenWidth - (anchor.x + anchor.width)),
    ...(opensUp ? { bottom: screenHeight - anchorTop } : { top: anchorBottom }),
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.menu, position]}>
        <ScrollView style={styles.scroll}>
          {options.map(({ label, value }) => {
            const isSelected = value === selectedValue;
            return (
              <TouchableOpacity
                key={value}
                style={styles.item}
                onPress={() => handleSelect(value)}
                testID={testIDPrefix ? `${testIDPrefix}_${value || 'default'}` : undefined}
              >
                <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    maxHeight: MENU_MAX_HEIGHT,
    backgroundColor: AppColors.osCardBackground,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  scroll: {
    borderRadius: 8,
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLabel: {
    ...AppTextStyles.bodyLarge,
    color: '#212121',
  },
  itemLabelSelected: {
    color: AppColors.osPrimary,
    fontWeight: '500',
  },
});

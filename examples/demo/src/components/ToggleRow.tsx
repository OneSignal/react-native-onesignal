import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { AppColors, AppTextStyles } from '../theme';

interface Props {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export default function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  testID,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E0E0E0', true: AppColors.osPrimary }}
        thumbColor={AppColors.white}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    ...AppTextStyles.bodyMedium,
    color: '#212121',
  },
  description: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey600,
    marginTop: 2,
  },
});
